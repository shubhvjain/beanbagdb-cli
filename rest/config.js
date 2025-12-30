import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import os from 'os';

export const getConfigPath = () => {
  return process.env.BBDB_CONFIG || path.join(os.homedir(), 'bbdb_config.json');
};

export const loadConfigFile = async (configPath = getConfigPath()) => {
  if (!existsSync(configPath)) {
    throw new Error(`Config file not found at ${configPath}. Run: bbdb new-db`);
  }

  try {
    const configFileContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configFileContent);

    if (!config.database) {
      throw new Error('Invalid config file: "database" field is missing.');
    }

    if (!config.rest || !config.rest.jwt || !config.rest.jwt_expiry) {
      throw new Error('Invalid config file: "rest.jwt" or "rest.jwt_expiry" field is missing.');
    }

    return config;
  } catch (err) {
    throw new Error(`Error reading/parsing config file: ${err.message}`);
  }
};
