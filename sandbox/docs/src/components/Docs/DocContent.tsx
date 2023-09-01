import * as Cinnabun from "cinnabun"

export const DocContent = ({ params }: { params: any }) => {
  console.log("asdasdasd", params)

  return <div>{params.title}</div>
}
