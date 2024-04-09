const { execSync } = require('child_process');

test('CLI GPT Tool should display welcome message', () => {
  const output = execSync('node server.js').toString();

  expect(output).toContain('CLI GPT Tool');
  expect(output).toContain('Interact with OpenAI GPT models directly from your terminal.');
});
