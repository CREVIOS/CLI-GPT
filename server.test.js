const { execSync } = require('child_process');

test('CLI GPT Tool should display welcome message', () => {
  // Run the CLI GPT tool using execSync and capture the output
  const output = execSync('node server.js').toString();

  // Check if the welcome message is displayed in the output
  expect(output).toContain('CLI GPT Tool');
  expect(output).toContain('Interact with OpenAI GPT models directly from your terminal.');
});
