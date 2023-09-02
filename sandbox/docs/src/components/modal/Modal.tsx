import * as Cinnabun from "cinnabun"
import { ComponentChildren, ComponentProps } from "cinnabun/types"
import { KeyboardListener, NavigationListener } from "cinnabun/listeners"
import { FadeInOut, Transition } from "cinnabun-transitions"
import "./Modal.css"
import { pathStore } from "../../state"

type ModalGestureProps = {
  closeOnNavigate?: boolean
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
}
const defaultGestures: ModalGestureProps = {
  closeOnNavigate: true,
  closeOnClickOutside: true,
  closeOnEscape: true,
}

type ModalProps = {
  visible: Cinnabun.Signal<boolean>
  toggle: (e: Event) => void
  gestures?: ModalGestureProps
  size?: "lg" | "md" | "sm"
}
export const Modal = (
  { visible, toggle, gestures = {}, size = "sm" }: ModalProps,
  children: ComponentChildren
) => {
  const _gestures = { ...defaultGestures, ...gestures }
  const { closeOnNavigate, closeOnClickOutside, closeOnEscape } = _gestures

  pathStore.subscribe(() => {
    if (closeOnNavigate && visible.value) toggle(new Event("click"))
  })

  const outerRef = Cinnabun.useRef()

  return (
    <FadeInOut
      properties={[{ name: "opacity", from: 0, to: 1, ms: 350 }]}
      className="modal-outer"
      tabIndex={-1}
      watch={visible}
      ref={outerRef}
      bind:visible={() => visible.value}
      cancelExit={() => visible.value}
      onclick={(e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target === outerRef.value && closeOnClickOutside) toggle(e)
      }}
    >
      <div tag="div" className="modal-wrapper">
        <Transition
          className={`modal ${size}`}
          properties={[
            { name: "translate", from: "0 -5rem", to: "0 0", ms: 350 },
          ]}
          watch={visible}
          bind:visible={() => visible.value}
          cancelExit={() => visible.value}
        >
          <NavigationListener onCapture={(e) => closeOnNavigate && toggle(e)} />
          <KeyboardListener
            keys={["Escape"]}
            onCapture={(_, e) => closeOnEscape && toggle(e)}
          />
          {children}
        </Transition>
      </div>
    </FadeInOut>
  )
}

export const ModalHeader = (
  props: ComponentProps,
  children: ComponentChildren
) => {
  return (
    <div className={`modal-header ${props.className}`} {...props}>
      {children}
    </div>
  )
}

export const ModalBody = (
  props: ComponentProps,
  children: ComponentChildren
) => {
  return (
    <div className={`modal-body ${props.className}`} {...props}>
      {children}
    </div>
  )
}

export const ModalFooter = (
  props: ComponentProps,
  children: ComponentChildren
) => {
  return (
    <div className={`modal-footer ${props.className}`} {...props}>
      {children}
    </div>
  )
}
