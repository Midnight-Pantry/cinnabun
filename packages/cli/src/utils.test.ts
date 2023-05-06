import {
  describe,
  expect,
  beforeAll,
  afterEach,
  beforeEach,
  assert,
  afterAll,
  it,
  vi,
} from "vitest"
import fs from "fs"
import {
  findFirstExistingFile,
  findRoot,
  getPackageJson,
  readENV,
} from "./utils"
import path from "path"

const packageJson = {
  name: "test",
  version: "1.0.0",
  description: "",
  main: "index.js",
  scripts: {
    start: "cinnabun start",
    build: "cinnabun build",
    dev: "cinnabun dev",
  },
}

const jsonToEnv = (json: Record<string, string>) => {
  return Object.entries(json)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")
}

describe("root and package.json", () => {
  const tempDir = ".tmp-test"

  afterEach(() => {
    fs.rmdirSync(tempDir, { recursive: true })
  })

  beforeEach(() => {
    fs.mkdirSync(path.join(tempDir, "src", "components"), { recursive: true })
    fs.writeFileSync(tempDir + "/package.json", JSON.stringify(packageJson))
  })

  it("should find the root when there is a package.json", () => {
    expect(findRoot(path.join(tempDir, "src", "components"))).toEqual(tempDir)
  })

  it("should find root and package.json when there is a package.json", () => {
    const pkg = getPackageJson(path.join(tempDir, "src", "components"))
    assert.deepEqual(pkg, packageJson)
  })

  it("readENV: should read only public env variables", () => {
    fs.writeFileSync(
      tempDir + "/.env",
      jsonToEnv({ PUBLIC_VAR: "public", PRIVATE_VAR: "private" })
    )
    const envVars = readENV(tempDir, { environment: "start" })
    expect(envVars).toEqual({ PUBLIC_VAR: "public" })
  })
})

describe("enviroment variables", () => {
  const tempDir = ".tmp-test"

  afterEach(() => {
    fs.rmdirSync(tempDir, { recursive: true })
  })

  beforeEach(() => {
    fs.mkdirSync(path.join(tempDir, "src", "components"), { recursive: true })
    fs.writeFileSync(tempDir + "/package.json", JSON.stringify(packageJson))
  })

  it("findFirstExistingFile: should find the first existing file", () => {
    fs.writeFileSync(tempDir + "/.env", "PUBLIC_VAR=public")
    fs.writeFileSync(tempDir + "/.env.local", "PUBLIC_VAR=local")
    fs.writeFileSync(tempDir + "/.env.development", "PUBLIC_VAR=development")

    const firstFound = findFirstExistingFile(
      [".env.development", ".env.local", ".env"],
      tempDir
    )

    const firstFound2 = findFirstExistingFile(
      [".env.local", ".env.development", ".env"],
      tempDir
    )

    const firstFound3 = findFirstExistingFile([".env", ".env.local"], tempDir)

    expect(firstFound).toEqual(path.join(tempDir, ".env.development"))
    expect(firstFound2).toEqual(path.join(tempDir, ".env.local"))
    expect(firstFound3).toEqual(path.join(tempDir, ".env"))
  })

  it("readENV: should read only public env variables in development", () => {
    fs.writeFileSync(
      path.join(tempDir, ".env"),
      jsonToEnv({ PUBLIC_VAR: "public", SECRET: "secret" })
    )
    const envVars = readENV(tempDir, { environment: "test" })
    expect(envVars).toEqual({ PUBLIC_VAR: "public" })
  })

  it("readENV: should read only public env variables in production", () => {
    fs.writeFileSync(
      path.join(tempDir, ".env"),
      jsonToEnv({ PUBLIC_VAR: "public", PRIVATE_VAR: "private" })
    )
    const envVars = readENV(tempDir, { environment: "start" })
    expect(envVars).toEqual({ PUBLIC_VAR: "public" })
  })
})
