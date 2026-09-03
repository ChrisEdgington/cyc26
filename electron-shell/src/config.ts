import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import defaults from '../shell.config.json';
import { ShellConfig } from './types';

// Configuration comes from shell.config.json, bundled at build time.
// Whoever installs the shell can override any field without rebuilding by
// dropping a shell.config.json into the app's userData directory (printed at
// startup). In dev (not packaged) devUrl wins over appUrl when set.
export function loadConfig(): ShellConfig {
  let config = { ...(defaults as ShellConfig) };

  const overridePath = path.join(app.getPath('userData'), 'shell.config.json');
  if (fs.existsSync(overridePath)) {
    try {
      config = { ...config, ...JSON.parse(fs.readFileSync(overridePath, 'utf8')) };
      console.log(`config override loaded from ${overridePath}`);
    } catch (error) {
      console.error(`failed to read ${overridePath}:`, error);
    }
  } else {
    console.log(`no config override at ${overridePath}`);
  }

  if (!app.isPackaged && config.devUrl) config.appUrl = config.devUrl;
  return config;
}
