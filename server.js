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

let currentContext = 'mainMenu'; 

console.log(chalk.blue('CLI GPT Tool'));
console.log(chalk.yellow('A simple CLI for interacting with OpenAI\'s GPT models.\n'));

const conversationHistory = []; 

const mainMenu = async () => {
  currentContext = 'mainMenu'; 
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
    currentContext = 'askPrompt'; 
    const { prompt } = await inquirer.prompt({
      type: 'input',
      name: 'prompt',
      message: 'Enter your prompt:',
    });
  
    const openai = initializeOpenAI();
    try {
      conversationHistory.push({ role: 'user', content: prompt });
  
      const completion = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: conversationHistory, 
      });
      console.log(chalk.magenta(completion.choices[0].message.content.trim()));
  
      conversationHistory.push({ role: 'assistant', content: completion.choices[0].message.content.trim() });
  
      const { askAgain } = await inquirer.prompt({
        type: 'confirm',
        name: 'askAgain',
        message: 'Do you want to ask another prompt?',
        default: false,
      });
  
      if (askAgain) {
        await askPrompt(); 
      } else {
        await mainMenu(); 
      }
    } catch (error) {
      console.error(chalk.red('Error calling the GPT API:', error));
    }
  };
  

const setApiKey = async () => {
  currentContext = 'setApiKey'; 
  const { apiKey } = await inquirer.prompt({
    type: 'input',
    name: 'apiKey',
    message: 'Enter your OpenAI API Key:',
  });

  config.set('OPENAI_API_KEY', apiKey);
  console.log(chalk.green('OpenAI API key set successfully.'));
  await mainMenu(); 
};

const viewApiKey = () => {
  currentContext = 'viewApiKey'; 
  const apiKey = config.get('OPENAI_API_KEY');
  if (apiKey) {
    console.log(chalk.green(`Current API Key: ${apiKey}`));
  } else {
    console.log(chalk.red('No API Key is set.'));
  }
    mainMenu(); 
};

const clearApiKey = () => {
  currentContext = 'clearApiKey'; 
  config.delete('OPENAI_API_KEY');
  console.log(chalk.green('API Key cleared.'));
   mainMenu(); 
};


figlet('CLI GPT Tool', (err, data) => {
  if (err) {
    console.log('Something went wrong with figlet...');
    console.dir(err);
    return;
  }
  console.log(chalk.blue(data));
  console.log(chalk.yellow('Interact with OpenAI GPT models directly from your terminal.\n'));

 
  mainMenu();
});
