import glob from "glob"
import fs from "fs"
import path from "path"
import { PackageJson } from "type-fest"

/**
 *
 * @param pattern  - The glob pattern to match
 * @returns A promise that resolves to an array of imported modules
 */
export const globImport = async (pattern: string) => {
  const files = glob.sync(pattern)
  return Promise.all(files.map((file) => import(file)))
}

/**
 * Find the root of the project by going up the directory tree until we find a package.json,
 * or until we hit the root of the filesystem.'
 *
 * @param cwd - The current working directory
 * @returns The root directory where the package.json is located
 */
export const findRoot = (cwd: string): string => {
  if (fs.existsSync(path.join(cwd, "package.json"))) {
    return cwd
  }
  const parent = path.dirname(cwd)
  if (parent === cwd) {
    throw new Error("Could not find root directory")
  }
  return findRoot(parent)
}

/**
 * Read the package.json and return it as an object.
 * @param cwd - The current working directory
 * @returns  The package.json as an object
 */
export const getPackageJson = (cwd: string) => {
  const root = findRoot(cwd)
  const packageJson = path.join(root, "package.json")
  if (!fs.existsSync(packageJson)) {
    throw new Error("Could not find package.json")
  }
  return JSON.parse(fs.readFileSync(packageJson, "utf-8")) as PackageJson
}

/**
 * Check if the current environment is production.
 * @returns Whether the current environment is production
 */
export const isProduction = () => process.env.NODE_ENV === "production"
export const isDevelopment = () => process.env.NODE_ENV === "development"
export const isTest = () => process.env.NODE_ENV === "test"

export const findFirstExistingFile = (files: string[], cwd: string) => {
  const existingFile = files.find((file) => fs.existsSync(path.join(cwd, file)))
  if (!existingFile) {
    return null
  }
  return path.join(cwd, existingFile)
}

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

const priorityEnv = {
  start: [
    ".env.development.local",
    ".env.development",
    ".env.production.local",
    ".env.production",
    ".env.local",
    ".env",
  ],
  build: [".env.production.local", ".env.production", ".env.local", ".env"],
  test: [".env.test.local", ".env.test", ".env"],
}

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
export const readENV = (
  cwd: string,
  config: { isServer?: boolean; environment: keyof typeof priorityEnv }
): Record<string, string> => {
  const root = findRoot(cwd)
  const envFiles = priorityEnv[config.environment]
  const envFile = findFirstExistingFile(envFiles, root)
  if (!envFile) {
    return {}
  }
  const env = fs.readFileSync(envFile, "utf-8")
  const envVars = env.split("\n").reduce((acc, line) => {
    const [key, value] = line.split("=")

    if (!key.startsWith("PUBLIC_") && !config.isServer) {
      return acc
    }

    if (key && value) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, string>)

  return envVars
}
