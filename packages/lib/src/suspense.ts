import { ComponentFunc, SuspenseProps } from "./types"
import { Component } from "./component"
import { Cinnabun } from "./cinnabun"
import { DomInterop } from "./domInterop"

export class SuspenseComponent extends Component<any> {
  promiseFunc: { (): Promise<any> } | undefined
  promiseInstance: Promise<any> | undefined
  promiseCache: any

  constructor(
    public tag: string,
    props: SuspenseProps & { children: [ComponentFunc] }
  ) {
    super(tag, props)
  }

  get childArgs(): any[] {
    return [!this.promiseCache, this.promiseCache]
  }
  resetPromise() {
    this.promiseFunc = undefined
    this.promiseCache = undefined
  }
  handlePromise(
    onfulfilled?: ((value: any) => void | PromiseLike<void>) | null | undefined,
    onrejected?: ((reason: any) => PromiseLike<never>) | null | undefined
  ) {
    if (onfulfilled) {
      this.promiseCache = onfulfilled
      if (Cinnabun.isClient) {
        DomInterop.unRender(this)
        DomInterop.reRender(this)
      }
      if (!this.props.cache) this.promiseCache = undefined
    } else if (onrejected) {
      console.error("handlePromise() - unhandle case 'onrejected'")
      debugger //todo
    } else {
      console.error("handlePromise() - unhandle case 'unknown'")
      debugger //todo
    }
  }

  setPromise(promise: { (): Promise<any> }) {
    if (!this.promiseFunc && promise) {
      this.promiseFunc = promise
      this.promiseInstance = this.promiseFunc()
      this.promiseInstance.then(this.handlePromise.bind(this))
    } else if (this.promiseFunc && !this.props.cache) {
      this.promiseInstance = this.promiseFunc()
      this.promiseInstance.then(this.handlePromise.bind(this))
    }
  }
}

export const Suspense = (
  { prefetch, promise, cache }: SuspenseProps,
  children: [ComponentFunc]
) => {
  return new SuspenseComponent("", { prefetch, promise, cache, children })
}
