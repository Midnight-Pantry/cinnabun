import * as Cinnabun from "cinnabun"
import { Docs } from "./Docs"
import { GettingStarted } from "./GettingStarted"
import { Logo } from "./Logo"
import { Modal, ModalBody, ModalHeader } from "./modal/Modal"
import { instructionsModalOpen } from "../state"
import { CloseIcon } from "./CloseIcon"

export const App = () => {
  return (
    <>
      <header>
        <div className="header-inner">
          <Logo />
          <h1 style="margin:0; color: rgba(255,255,255,.85);">Cinnabun</h1>
          <button onclick={() => (instructionsModalOpen.value = true)}>
            Get Started
          </button>
        </div>
      </header>
      <main>
        <Docs />
      </main>
      <footer></footer>
      <Modal
        visible={instructionsModalOpen}
        toggle={() => (instructionsModalOpen.value = false)}
      >
        <ModalHeader>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <h3 className="modal-title">Getting Started</h3>
            <button onclick={() => (instructionsModalOpen.value = false)}>
              <CloseIcon />
            </button>
          </div>
        </ModalHeader>
        <ModalBody>
          <GettingStarted />
        </ModalBody>
      </Modal>
    </>
  )
}
