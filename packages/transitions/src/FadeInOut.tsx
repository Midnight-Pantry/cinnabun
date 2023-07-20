import { PropsWithChildren } from "cinnabun/types"
import { Transition } from "./Transition"
import { TransitionProps } from "./types"

export const FadeInOut = ({
  properties = [],
  ...rest
}: PropsWithChildren & TransitionProps) => {
  properties.push({
    name: "opacity",
    from: "0",
    to: "1",
  })
  return Transition({ ...rest, properties })
}
