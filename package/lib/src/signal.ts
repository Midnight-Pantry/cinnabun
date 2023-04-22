// Disclaimer: I stole this from EmNudge. Subscribe and pay respects to lord EmNudge.

// initially undefined. We can set it to null instead.
let computeFunc: { (): any } | null = null

const LOG_NUM_SUBS = false

export class Signal<T> {
  private _val: T
  private _subscribers: Set<{ (val: T): any }> = new Set()
  private _name?: string
  constructor(value: T, name?: string) {
    this._val = value
    this._name = name
  }

  get value() {
    // If it exists, we add it to the subscribers.
    // Do not call it, unlike a regular subscriber.
    if (computeFunc) {
      this._subscribers.add(computeFunc)
      this.logSubscriberCount()
    }

    return this._val
  }

  set value(newVal: T) {
    this._val = newVal
    for (const subscribeFunc of this._subscribers) {
      subscribeFunc(newVal)
    }
  }

  subscribe(func: { (val: T): any }) {
    this._subscribers.add(func)
    this.logSubscriberCount()
    func(this._val)
    return () => this.unsubscribe(func)
  }
  unsubscribe(func: { (val: T): any }) {
    this._subscribers.delete(func)
    this.logSubscriberCount()
  }

  serialize(): string {
    return JSON.stringify(this.value)
  }

  logSubscriberCount() {
    if (LOG_NUM_SUBS)
      console.debug(this._name + " subscribers:", this._subscribers.size)
  }
}

export function computed<T>(func: { (): any }, name?: string) {
  const signal = new Signal<T | null>(null, name)

  // move the local variable assignment into the subcribed function
  const fn = () => {
    const prevVal = computeFunc
    computeFunc = fn

    signal.value = func()

    computeFunc = prevVal
  }

  fn()

  return signal as Signal<T>
}

export function createSignal<T>(initialValue: T) {
  return new Signal<T>(initialValue)
}
