import * as Cinnabun from "cinnabun"
import { Route } from "cinnabun/router"
import { RouteProps } from "cinnabun/types"
import { SlideInOut } from "./SlideInOut"

export const AnimatedRoute = ({ path, component: Component }: RouteProps) => {
  return (
    <Route
      path={path}
      component={(props: any[]) => {
        return (
          <SlideInOut settings={{ from: "left" }} absoluteExit>
            {typeof Component === "function" ? (
              <Component {...props} />
            ) : (
              Component
            )}
          </SlideInOut>
        )
      }}
    />
  )
}
