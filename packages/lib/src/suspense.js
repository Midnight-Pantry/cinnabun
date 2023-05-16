import { Component } from "./component"
import { Cinnabun } from "./cinnabun"
import { DomInterop } from "./domInterop"

export class SuspenseComponent extends Component {
  /** @type { { (): Promise<any> } | undefined } */
  promiseFunc = undefined

  /** @type { Promise<any> | undefined } */
  promiseInstance = undefined

  /** @type {any} */
  promiseCache = undefined

  /**
   * @param {string} tag
   * @param {import("./types").SuspenseProps & { children: [{(...args: any[]): Component}] }} props
   */
  constructor(tag, props) {
    super(tag, props)
  }

  get childArgs() {
    return [!this.promiseCache, this.promiseCache]
  }

  resetPromise() {
    this.promiseFunc = undefined
    this.promiseCache = undefined
  }

  /**
   * @param {((value: any) => void | PromiseLike<void>) | null | undefined} onfulfilled
   * @param {((reason: any) => PromiseLike<never>) | null | undefined} onrejected
   */
  handlePromise(onfulfilled, onrejected) {
    if (onfulfilled) {
      this.promiseCache = onfulfilled
      if (Cinnabun.isClient) {
        DomInterop.unRender(this)
        DomInterop.reRender(this)
      }
      if (!this.getProps().cache) this.promiseCache = undefined
    } else if (onrejected) {
      console.error("handlePromise() - unhandle case 'onrejected'")
      debugger //todo
    } else {
      console.error("handlePromise() - unhandle case 'unknown'")
      debugger //todo
    }
  }

  /** @param {{ (): Promise<any> }} [promiseFunc] */
  setPromise(promiseFunc) {
    if (!this.promiseFunc && promiseFunc) {
      this.promiseFunc = promiseFunc
      this.promiseInstance = this.promiseFunc()
      this.promiseInstance.then(this.handlePromise.bind(this))
    } else if (this.promiseFunc && !this.getProps().cache) {
      this.promiseInstance = this.promiseFunc()
      this.promiseInstance.then(this.handlePromise.bind(this))
    }
  }
}

/**
 * @param {import("./types").SuspenseProps} param0
 * @param {[{(loading: boolean, res:*):Component}]} children
 * @returns {SuspenseComponent}
 */
export const Suspense = ({ prefetch, promise, cache }, children) => {
  return new SuspenseComponent("", { prefetch, promise, cache, children })
}
