import * as Cinnabun from "cinnabun"
import { PropsWithChildren } from "cinnabun/types"
import { Transition, TransitionProperty } from "./Transition"

export const FadeInOut = ({
  children,
  properties,
  ...rest
}: PropsWithChildren & { properties?: TransitionProperty[] }) => {
  return (
    <Transition
      properties={[
        { name: "opacity", from: "0", to: "1" },
        ...(properties ?? []),
      ]}
      {...rest}
    >
      {children}
    </Transition>
  )
}
