import * as Cinnabun from "cinnabun"
import { PropsWithChildren } from "cinnabun/types"
import { Transition } from "./Transition"
import { TransitionProperty } from "./types"

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
