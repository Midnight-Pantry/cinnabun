import * as Cinnabun from "cinnabun"
import { createPortal } from "cinnabun"
import { PropsWithChildren } from "cinnabun/types"

const Portal = ({ children }: PropsWithChildren) => {
  const rootId = "portal-root"
  return createPortal(children ?? [], rootId)
}

enum ActiveModal {
  None,
  A,
  B,
}

const activeModal = Cinnabun.createSignal(ActiveModal.None)
const setActiveModal = (modal: ActiveModal) => {
  activeModal.value = modal
}

export const PortalExample = () => {
  return (
    <>
      <button onclick={() => setActiveModal(ActiveModal.A)}>Modal A</button>
      <button onclick={() => setActiveModal(ActiveModal.B)}>Modal B</button>

      <Portal>
        <div
          watch={activeModal}
          bind:visible={() => activeModal.value === ActiveModal.A}
        >
          <div
            style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,.5);z-index:1000"
            onclick={() => setActiveModal(ActiveModal.None)}
          ></div>
          <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#222;color:white;z-index:1001;padding:1rem;">
            <h2>Modal A</h2>
            <button onclick={() => setActiveModal(ActiveModal.None)}>
              Close
            </button>
          </div>
        </div>
      </Portal>
      <Portal>
        <div
          watch={activeModal}
          bind:visible={() => activeModal.value === ActiveModal.B}
        >
          <div
            style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,.5);z-index:1000"
            onclick={() => setActiveModal(ActiveModal.None)}
          ></div>
          <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#222;color:white;z-index:1001;padding:1rem;">
            <h2>Modal B</h2>
            <button onclick={() => setActiveModal(ActiveModal.None)}>
              Close
            </button>
          </div>
        </div>
      </Portal>
    </>
  )
}
