import { RouteComponent } from "../component"
import { RouteProps } from "../types"

export const Route = ({ path, component }: RouteProps) => {
  return new RouteComponent(path, component)
}
