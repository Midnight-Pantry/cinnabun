// Disclaimer: I stole this from EmNudge. Subscribe and pay respects to lord EmNudge.

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
    return this._val
  }

  set value(newVal: T) {
    this._val = newVal
    this.notify()
  }

  notify() {
    for (const subscribeFunc of this._subscribers) {
      subscribeFunc(this._val)
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

export function computed<T>(signal: Signal<any>, func: { (): T }): Signal<T> {
  const _signal = new Signal<T | null>(null)
  _signal.value = func()
  signal.subscribe(() => {
    _signal.value = func()
  })

  return _signal as Signal<T>
}

export function createSignal<T>(initialValue: T) {
  return new Signal<T>(initialValue)
}
