import * as Cinnabun from "cinnabun"

export default function Page() {
  return (
    <Cinnabun.Suspense promise={() => import(`./test`)}>
      {(loading: boolean, component: any) => {
        return loading ? <p>loading...</p> : component.default()
      }}
    </Cinnabun.Suspense>
  )
}
