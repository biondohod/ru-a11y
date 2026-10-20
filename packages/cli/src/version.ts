import packageJson from '../package.json';

/** CLI version, read from package.json so it can never drift from the published one. */
export const VERSION: string = packageJson.version;
