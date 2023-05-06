import * as Cinnabun from "cinnabun"

export default function Page() {
  return (
    <Cinnabun.Suspense promise={() => import(`./test`)}>
      {(loading: boolean, data: any) => {
        return loading ? <p>loading...</p> : data.test()
      }}
    </Cinnabun.Suspense>
  )
}
