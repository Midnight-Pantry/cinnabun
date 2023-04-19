import * as Cinnabun from "cinnabun"
type AppArgs = {
  test?: number
}
export const App = (args?: AppArgs) => {
  console.log(args?.test)
  return <div>Test</div>
}
