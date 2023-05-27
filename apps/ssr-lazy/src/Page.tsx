import * as Cinnabun from "cinnabun"

export default function Page(props: any) {
  const { params, state } = props
  let interval: string | number | NodeJS.Timer | undefined
  return (
    <div>
      <h2
        onMounted={() => (interval = setInterval(() => state.value++, 1000))}
        onUnmounted={() => clearInterval(interval)}
      >
        {params?.test ? [params.test, " - ", state] : state}
      </h2>
    </div>
  )
}
