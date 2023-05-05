import { PackageJson } from "type-fest";
/**
 *
 * @param pattern  - The glob pattern to match
 * @returns A promise that resolves to an array of imported modules
 */
export declare const globImport: (pattern: string) => Promise<any[]>;
export declare const pad: (str: string, width: number) => string;
/**
 * Find the root of the project by going up the directory tree until we find a package.json,
 * or until we hit the root of the filesystem.'
 *
 * @param cwd - The current working directory
 * @returns The root directory where the package.json is located
 */
export declare const findRoot: (cwd: string) => string;
/**
 * Read the package.json and return it as an object.
 * @param cwd - The current working directory
 * @returns  The package.json as an object
 */
export declare const getPackageJson: (cwd: string) => PackageJson;
/**
 * Check if the current environment is production.
 * @returns Whether the current environment is production
 */
export declare const isProduction: () => boolean;
export declare const isDevelopment: () => boolean;
export declare const isTest: () => boolean;
export declare const findFirstExistingFile: (files: string[], cwd: string) => string | null;
/**
#### What other .env files can be used?

*Note: this feature is available with react-scripts@1.0.0 and higher.*

- `.env`: Default.
- `.env.local`: Local overrides. This file is loaded for all environments except test.
- `.env.development`, `.env.test`, `.env.production`: Environment-specific settings.
- `.env.development.local`, `.env.test.local`, `.env.production.local`: Local overrides of environment-specific settings.

#### Files on the left have more priority than files on the right:

- `npm start`: `.env.development.local`, `.env.development`, `.env.local`, `.env`
- `npm run build`: `.env.production.local`, `.env.production`, `.env.local`, `.env`
- `npm test`: `.env.test.local`, `.env.test`, `.env` (note `.env.local` is missing)

These variables will act as the defaults if the machine does not explicitly set them.
Please refer to the [dotenv documentation](https://github.com/motdotla/dotenv) for more details.

[Source](https://create-react-app.dev/docs/adding-custom-environment-variables)
*/
declare const priorityEnv: {
    start: string[];
    build: string[];
    test: string[];
};
/**
 * Read the .env file and return an object with the values.
 * Envionment variables that have a prefix of PUBLIC_ are exposed to the client.
 * while all other variables are only available to the server.
 *
 * @param cwd - The current working directory
 * @param config - Configuration options
 * @param config.private - Whether to include private variables
 * @returns An object with the environment variables
 */
export declare const readENV: (cwd: string, config: {
    isServer?: boolean;
    environment: keyof typeof priorityEnv;
}) => Record<string, string>;
export {};
