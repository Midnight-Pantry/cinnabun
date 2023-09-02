import * as Cinnabun from "cinnabun"
import { ComponentProps } from "cinnabun/types"

export const CloseIcon = (props: ComponentProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25rem"
      viewBox="0 0 24 24"
      fill="none"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke={"#fff"}
      className="stroke"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
