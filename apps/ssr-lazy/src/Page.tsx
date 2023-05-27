import * as Cinnabun from "cinnabun"

const state = Cinnabun.createSignal(123)

export default function Page(props: any) {
  return (
    <div>
      <h2 onMounted={() => setInterval(() => state.value++, 1000)}>
        Home - {props?.params?.test ?? "params.test"} - {state}
      </h2>
    </div>
  )
}
