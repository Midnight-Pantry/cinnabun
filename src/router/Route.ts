import { Component } from "../component"
import { RouteProps } from "../types"

export const Route = ({ path, component }: RouteProps) => {
  return new Component<any>("", {
    path,
    pathDepth: path.split("").filter((chr) => chr === "/").length,
    render: false,
    children: [component],
  })
}
