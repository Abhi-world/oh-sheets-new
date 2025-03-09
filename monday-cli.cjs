// monday-cli.cjs
// Script to load environment variables from .env and run Monday CLI commands
// Using CommonJS format (.cjs extension) to allow require statements

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Get the Monday CLI command and arguments from process arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Please provide a Monday CLI command');
  console.log('Example: node monday-cli.cjs boards list');
  process.exit(1);
}

// Check if MONDAY_API_TOKEN is available in environment variables
if (!process.env.MONDAY_API_TOKEN) {
  console.error('MONDAY_API_TOKEN not found in .env file');
  process.exit(1);
}

console.log('Using API token from .env file');

// Create environment variables object with the API token
const env = {
  ...process.env,
  MONDAY_API_TOKEN: process.env.MONDAY_API_TOKEN,
  MAPPS_TOKEN: process.env.MONDAY_API_TOKEN // Add the token with the name that Monday CLI expects
};

// Use npx to run the Monday CLI
const mondayProcess = spawn('npx', ['--yes', '@mondaycom/apps-cli', ...args], {
  env,
  shell: true,
  stdio: 'inherit' // This will pipe the child process's stdout and stderr to the parent process
});

// Handle process exit
mondayProcess.on('close', (code) => {
  process.exit(code);
});