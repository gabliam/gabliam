import path from 'path';
import { findMonorepoConfig } from './utils/workspace-utils';

export const APP_DIR = path.resolve(__dirname, '../../');

export const DIST_DIR = path.resolve(APP_DIR, 'dist');

export const monoRepo = findMonorepoConfig(APP_DIR);
