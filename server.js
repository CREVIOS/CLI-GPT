#! /usr/bin/env node
import OpenAI from 'openai';
import Conf from 'conf';
import chalk from 'chalk';
import inquirer from 'inquirer';
import figlet from 'figlet';


const config = new Conf({
  projectName: 'cli_gpt',
});

const initializeOpenAI = () => {
  const apiKey = config.get('OPENAI_API_KEY');
  if (!apiKey) {
    console.error(chalk.red('OpenAI API key is not set. Use "set-key <API_KEY>" to set it.'));
    process.exit(1);
  }
  return new OpenAI({ apiKey });
};

let currentContext = 'mainMenu'; // Initialize current context to main menu

// Display a header
console.log(chalk.blue('CLI GPT Tool'));
console.log(chalk.yellow('A simple CLI for interacting with OpenAI\'s GPT models.\n'));

const conversationHistory = []; // Initialize conversation history array

const mainMenu = async () => {
  currentContext = 'mainMenu'; // Update current context
  const action = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'Select an option:',
    choices: [
      { name: 'Ask a prompt', value: 'ask' },
      { name: 'Set OpenAI API Key', value: 'set-key' },
      { name: 'View current API Key', value: 'view-key' },
      { name: 'Clear current API Key', value: 'clear-key' },
      new inquirer.Separator(),
      { name: 'Exit', value: 'exit' }
    ],
  }]);

  switch (action.action) {
    case 'ask':
      await askPrompt();
      break;
    case 'set-key':
      await setApiKey();
      break;
    case 'view-key':
      viewApiKey();
      break;
    case 'clear-key':
      clearApiKey();
      break;
    case 'exit':
      console.log(chalk.green('Exiting...'));
      process.exit(0);
  }
};

const askPrompt = async () => {
    currentContext = 'askPrompt'; // Update current context
    const { prompt } = await inquirer.prompt({
      type: 'input',
      name: 'prompt',
      message: 'Enter your prompt:',
    });
  
    const openai = initializeOpenAI();
    try {
      // Add user message to conversation history
      conversationHistory.push({ role: 'user', content: prompt });
  
      const completion = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: conversationHistory, // Send conversation history along with the prompt
      });
      console.log(chalk.magenta(completion.choices[0].message.content.trim()));
  
      // Add AI response to conversation history with the role 'assistant'
      conversationHistory.push({ role: 'assistant', content: completion.choices[0].message.content.trim() });
  
      const { askAgain } = await inquirer.prompt({
        type: 'confirm',
        name: 'askAgain',
        message: 'Do you want to ask another prompt?',
        default: false,
      });
  
      if (askAgain) {
        await askPrompt(); // Call askPrompt recursively if the user wants to ask another prompt
      } else {
        await mainMenu(); // Otherwise, go back to the main menu
      }
    } catch (error) {
      console.error(chalk.red('Error calling the GPT API:', error));
    }
  };
  

const setApiKey = async () => {
  currentContext = 'setApiKey'; // Update current context
  const { apiKey } = await inquirer.prompt({
    type: 'input',
    name: 'apiKey',
    message: 'Enter your OpenAI API Key:',
  });

  config.set('OPENAI_API_KEY', apiKey);
  console.log(chalk.green('OpenAI API key set successfully.'));
  await mainMenu(); // Go back to the main menu
};

const viewApiKey = () => {
  currentContext = 'viewApiKey'; // Update current context
  const apiKey = config.get('OPENAI_API_KEY');
  if (apiKey) {
    console.log(chalk.green(`Current API Key: ${apiKey}`));
  } else {
    console.log(chalk.red('No API Key is set.'));
  }
    mainMenu(); // Go back to the main menu
};

const clearApiKey = () => {
  currentContext = 'clearApiKey'; // Update current context
  config.delete('OPENAI_API_KEY');
  console.log(chalk.green('API Key cleared.'));
   mainMenu(); // Go back to the main menu
};

// Remove commander usage for a more interactive experience
figlet('CLI GPT Tool', (err, data) => {
  if (err) {
    console.log('Something went wrong with figlet...');
    console.dir(err);
    return;
  }
  console.log(chalk.blue(data));
  console.log(chalk.yellow('Interact with OpenAI GPT models directly from your terminal.\n'));

  // Continue with the rest of your CLI setup here, like calling mainMenu()
  mainMenu();
});
