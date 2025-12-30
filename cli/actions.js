import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import os from 'os';
import { getConfigPath, getConfig, saveConfig, initConfigFile, fileExists } from './config.js';

const databaseFolderName = 'bbdb';
const rootDatabasePath = path.join(os.homedir(), databaseFolderName);
const logFilePath = path.join(rootDatabasePath, 'rest_logs.txt');

const validateDatabaseName = (dbName) => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(dbName);

export const listDatabases = async () => {
  if (!(await fileExists(getConfigPath()))) {
    console.log('Configuration file missing. Use `bbdb new-db database-name` to create.');
    return;
  }

  const config = await getConfig();
  if (Object.keys(config.database).length === 0) {
    console.log('No databases defined. Use `bbdb new-db database-name` to add one.');
  } else {
    console.log('Defined databases:');
    Object.entries(config.database).forEach(([name, db]) => {
      console.log(`- ${name} (${db.folderlink || 'no folder'})`);
    });
  }
};

export const addDatabase = async (args) => {
  if (args.length !== 1) {
    console.error('Usage: bbdb new-db <database-name>');
    return;
  }

  const dbName = args[0];
  if (!validateDatabaseName(dbName)) {
    console.error('Invalid database name. Please use a single word with letters, numbers, underscores, or hyphens (alphanumeric with no spaces).');
    return;
  }

  if (!(await fileExists(getConfigPath()))) {
    console.log('Configuration file missing, creating a new one.');
    await initConfigFile();
  }

  const config = await getConfig();
  if (config.database[dbName]) {
    console.error(`Database "${dbName}" already defined.`);
    return;
  }

  // Ensure root database folder exists
  if (!(await fileExists(rootDatabasePath))) {
    await fs.mkdir(rootDatabasePath);
    console.log(`Root folder ${rootDatabasePath} created.`);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = (question) => new Promise((resolve) => {
    rl.question(question, resolve);
  });

  const type = await prompt('Database Type [couchdb]: ') || 'couchdb';
  const validTypes = ['couchdb'];
  if (!validTypes.includes(type.toLowerCase())) {
    console.error('Invalid database type. Valid options are: couchdb');
    rl.close();
    return;
  }

  const url = await prompt('Database URL: ');
  const encryptionKey = await prompt('Encryption Key: ');
  const docFolder = await prompt('Folder link: ');
  rl.close();

  // Create database folder
  const dbFolderPath = path.join(rootDatabasePath, dbName);
  if (!(await fileExists(dbFolderPath))) {
    await fs.mkdir(dbFolderPath);
    console.log(`Database folder ${dbFolderPath} created.`);
  } else {
    console.log(`Database folder ${dbFolderPath} already exists.`);
  }

  config.database[dbName] = {
    name: dbName,
    type: type.toLowerCase(),
    url,
    encryption_key: encryptionKey,
    folderlink: docFolder,
    created: Math.floor(Date.now() / 1000)
  };

  await saveConfig(config);
  console.log(`\nDatabase "${dbName}" added successfully!`);
  console.log(`Config saved to: ${getConfigPath()}`);
  console.log(`\nYou can now use it with the CLI and REST API.`);
};
