import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import os from 'os';

export const getConfigPath = () => {
  return process.env.BBDB_CONFIG || path.join(os.homedir(), 'bbdb_config.json');
};

export const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const getConfig = async () => {
  const configPath = getConfigPath();
  try {
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (err) {
    console.error(`Error reading the config file: ${err.message}`);
    process.exit(1);
  }
};

export const saveConfig = async (config) => {
  const configPath = getConfigPath();
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  } catch (err) {
    console.error(`Error saving the config file: ${err.message}`);
    process.exit(1);
  }
};

export const initConfigFile = async () => {
  const configPath = getConfigPath();
  const defaultConfig = {
    database: {},
    rest: {
      jwt: generateRandomCode(),
      jwt_expiry: 60,
      log_file_path: path.join(os.homedir(), 'bbdb', 'rest_logs.txt')
    }
  };
  await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
};

const generateRandomCode = () => {
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;
  return randomNumber.toString(16);
};
