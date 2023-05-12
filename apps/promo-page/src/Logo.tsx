import CinnabunHappy from "./svg/cb-Happy"
import CinnabunJoy from "./svg/cb-Joy"
import { createSignal } from "cinnabun"

export const Logo = () => {
  const activeSvg = createSignal("Happy")

  const toggleSvg = (val: boolean) => {
    activeSvg.value = val ? "Joy" : "Happy"
  }

  return (
    <div
      watch={activeSvg}
      bind:render
      onmouseover={() => toggleSvg(true)}
      onmouseleave={() => toggleSvg(false)}
    >
      {() =>
        activeSvg.value === "Happy" ? (
          <CinnabunHappy dimensions={["100px"]} />
        ) : (
          <CinnabunJoy dimensions={["100px"]} />
        )
      }
    </div>
  )
}
