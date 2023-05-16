/**
 * @typedef {{(): *}} ComputeFunction
 * @returns {*} - The computed value.
 */

/** @type {ComputeFunction | null} */
let computeFunc = null

/** @type {boolean} */
const LOG_NUM_SUBS = false

/**
 * @class
 * @template {*} T
 */
export class Signal {
  /**
   * @param {T} value - The initial value of the signal.
   * @param {string} [name] - The name of the signal.
   */
  constructor(value, name) {
    /**
     * @private
     * @type {T}
     */
    this._val = value
    /**
     * @private
     * @type {Set<{(val:T): void}>}
     */
    this._subscribers = new Set()
    /**
     * @private
     * @type {string | undefined}
     */
    this._name = name
  }

  /**
   * Getter for the signal value.
   * @returns {*} - The signal value.
   */
  get value() {
    if (computeFunc) {
      this._subscribers.add(computeFunc)
      this.logSubscriberCount()
    }

    return this._val
  }

  /**
   * Setter for the signal value.
   * @param {*} newVal - The new value to set.
   */
  set value(newVal) {
    this._val = newVal
    this.notify()
  }

  /**
   * Notifies all subscribers of a value change.
   */
  notify() {
    for (const subscribeFunc of this._subscribers) {
      subscribeFunc(this._val)
    }
  }

  /**
   * Subscribes a function to the signal.
   * @param {{(val:T): void}} func - The function to subscribe.
   * @returns {{(): void}} - The unsubscribe function.
   */
  subscribe(func) {
    this._subscribers.add(func)
    this.logSubscriberCount()
    func(this._val)
    return () => this.unsubscribe(func)
  }

  /**
   * Unsubscribes a function from the signal.
   * @param {{(val:T): void}} func - The function to unsubscribe.
   */
  unsubscribe(func) {
    this._subscribers.delete(func)
    this.logSubscriberCount()
  }

  /**
   * Serializes the signal value to a string.
   * @returns {string} - The serialized signal value.
   */
  serialize() {
    return JSON.stringify(this.value)
  }
  /**
   * Logs the number of subscribers.
   */
  logSubscriberCount() {
    if (LOG_NUM_SUBS) {
      console.debug(this._name + " subscribers:", this._subscribers.size)
    }
  }

  /**
   * Checks if a value is a Signal.
   * @param {*} data - The value to check.
   * @returns {data is Signal} - True if the value is a Signal, false otherwise.
   */
  static isSignal(data) {
    return (
      typeof data === "object" && "subscribe" in data && "unsubscribe" in data
    )
  }
}

/**
 * Creates a computed signal.
 * @param {ComputeFunction} func - The computation function.
 * @param {string} [name] - The name of the computed signal.
 * @returns {Signal} - The computed signal.
 */
export function computed(func, name) {
  const signal = new Signal(null, name)

  const fn = () => {
    const prevVal = computeFunc
    computeFunc = fn

    signal.value = func()

    computeFunc = prevVal
  }

  fn()

  return signal
}

/**
 * Creates a new signal.
 * @template {*} T
 * @param {T} initialValue - The initial value of the signal.
 * @returns {Signal<T>} - The created signal.
 */
export function createSignal(initialValue) {
  return new Signal(initialValue)
}
