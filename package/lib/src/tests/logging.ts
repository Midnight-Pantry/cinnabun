export const logger = (key: string) => {
  return function log(key2: any) {
    console.log(`----- ${key} ${key2}`)
  }
}
