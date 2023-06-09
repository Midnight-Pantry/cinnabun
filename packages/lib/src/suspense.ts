import { ComponentFunc, SuspenseProps } from "./types"
import { Component } from "./component"
import { Cinnabun } from "./cinnabun"
import { DomInterop } from "./domInterop"

export class SuspenseComponent extends Component {
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
    if (onrejected) {
      console.error("handlePromise() - unhandle case 'onrejected'")
      debugger //todo
      return
    }
    this.promiseCache = onfulfilled
    if (Cinnabun.isClient) {
      DomInterop.unRender(this)
      DomInterop.reRender(this)
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

/**
 * @description
 * A component that renders a fallback while waiting for a promise to resolve
 * @example
 * ```tsx
 * <Suspense promise={fetchData}>
 *  {(loading, data) => {
 *   if (loading) return <Loading />
 *    return <YourComponent data={data} />
 *  }}
 * </Suspense>
 * ```
 */
export const Suspense = (
  {
    promise,
    cache,
    prefetch,
    "prefetch:defer": deferredPrefetch,
  }: SuspenseProps,
  children: [ComponentFunc]
) => {
  return new SuspenseComponent(
    "",
    Object.assign(
      { promise, cache, children },
      prefetch
        ? { prefetch }
        : deferredPrefetch
        ? { "prefetch:defer": deferredPrefetch }
        : {}
    )
  )
}
