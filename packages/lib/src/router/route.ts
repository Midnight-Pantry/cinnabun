import { Component } from "../component"
import { ComponentChild, RouteProps } from "../types"

export class RouteComponent extends Component<any> {
  constructor(path: string, component: ComponentChild) {
    super("", {
      path,
      pathDepth: path.split("").filter((chr) => chr === "/").length,
      children: [component],
      render: false,
    })
  }

  get childArgs() {
    return [{ params: this.props.params }]
  }
}

export const Route = ({ path, component }: RouteProps) => {
  return new RouteComponent(path, component)
}
