import * as Cinnabun from "cinnabun"

export const Toast = ({
  success,
  text,
}: {
  success: boolean
  text: string
}) => {
  return (
    <div className={`toast ${success ? "success" : "warning"}`}>{text}</div>
  )
}
