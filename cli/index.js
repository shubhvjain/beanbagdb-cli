#!/usr/bin/env node

import { listDatabases, addDatabase } from './actions.js';

const commandHandlers = {
  list: {
    description: 'List all defined databases',
    usage: 'bbdb list',
    action: async () => await listDatabases()
  },
  'new-db': {
    description: 'Add a new database definition',
    usage: 'bbdb new-db <database-name>',
    action: async (args) => await addDatabase(args)
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Default action or help message
    await commandHandlers.list.action();
    return;
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  if (command in commandHandlers) {
    await commandHandlers[command].action(commandArgs);
  } else {
    console.error(`Unknown command: ${command}`);
    console.log('\nAvailable commands:');
    for (const cmd in commandHandlers) {
      console.log(`  ${cmd.padEnd(10)} ${commandHandlers[cmd].description}`);
    }
    console.log(`\nUsage example: ${commandHandlers['new-db'].usage}`);
  }
};

main().catch(console.error);
