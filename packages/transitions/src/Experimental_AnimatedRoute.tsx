import { Route } from "cinnabun/router"
import { RouteProps } from "cinnabun/types"
import { SlideInOut } from "./SlideInOut"

export const Experimental_AnimatedRoute = ({
  path,
  component: Component,
}: RouteProps) => {
  return Route({
    path,
    component: (props: any[]) => {
      return SlideInOut({
        tag: "",
        settings: { from: "left" },
        absoluteExit: true,
        children: [
          typeof Component === "function" ? Component(...props) : Component,
        ],
      })
    },
  })
}
