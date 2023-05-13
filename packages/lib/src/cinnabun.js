import { Component } from "./component.js"
import { DomInterop } from "./domInterop.js"
export { h, fragment } from "./index.js"

/**
 * @template InstanceType
 * @typedef {Object} ClassConstructor
 * @property {new (...args: any[]) => InstanceType} new - The constructor function for the class.
 */

/**
 * @template Class
 * @typedef {InstanceType<ClassConstructor<Class>>} RuntimeService
 */

/**
 * Represents the data for a server request.
 * @typedef {Object} ServerRequestData
 * @property {string} path - The path of the server request.
 * @property {Object.<string, *>} data - The data associated with the server request.
 */

export class Cinnabun {
  /** @readonly */
  static DEBUG_COMPONENT_REFCOUNT = false
  /** @readonly @type {boolean} */
  static isClient = "window" in globalThis

  // ~~~~~ CLIENT SINGLETON
  /** @type {Map<Element | ChildNode, number>} */
  static rootMap = new Map()

  /** @type {import('./types.js').WatchedElementRef[]} */
  static componentReferences = []

  /** @type {RuntimeService<any>[]} */
  static runtimeServices = []

  // ~~~~~ SSR INSTANCE
  /** @private @type {import('./types.js').WatchedElementRef[]} */
  serverComponentReferences = []

  /** @private @type {ServerRequestData} */
  serverRequest = {
    path: "/",
    data: {},
  }

  /** @param {ServerRequestData} data */
  setServerRequestData(data) {
    this.serverRequest = data
  }

  /**
   * Retrieve server request data based on the provided keys path.
   * @template T - The type of the requested data.
   * @param {string} keysPath - The dot-separated keys path to retrieve the data.
   * @returns {T | undefined} - The requested data or undefined if not found.
   */
  getServerRequestData(keysPath) {
    const props = keysPath.split(".")
    let value = { ...this.serverRequest }
    for (let i = 0; i < props.length; i++) {
      value = value[props[i]]
      if (value === undefined) {
        return undefined
      }
    }
    return value
  }

  /**
   * @param {Component} app
   * @param {HTMLElement} root
   */
  static bake(app, root) {
    const tray = new Component(root.tagName, {
      children: [app],
    })
    tray.element = root
    DomInterop.render(tray)
  }

  /** @param {Component} component */
  static getComponentReferences(component) {
    return Cinnabun.isClient
      ? Cinnabun.componentReferences
      : component.cbInstance.serverComponentReferences
  }

  /** @param {Component} component */
  static removeComponentReferences(component) {
    Cinnabun.removeComponentChildReferences(component)

    if (Cinnabun.isClient) {
      Cinnabun.componentReferences = Cinnabun.componentReferences.filter(
        (c) => c.component !== component
      )
    } else {
      component.cbInstance.serverComponentReferences =
        component.cbInstance.serverComponentReferences.filter(
          (c) => c.component !== component
        )
    }
  }

  /** @param {Component} component */
  static removeComponentChildReferences(component) {
    for (const c of component.children) {
      if (Component.isComponent(c)) Cinnabun.removeComponentReferences(c)
    }
  }

  /** @param {import('./types.js').WatchedElementRef} ref */
  static addComponentReference = (ref) => {
    if (Cinnabun.isClient) {
      Cinnabun.componentReferences.push(ref)
    } else {
      ref.component.cbInstance.serverComponentReferences.push(ref)
    }

    if (Cinnabun.DEBUG_COMPONENT_REFCOUNT)
      Cinnabun.logComponentRefCount(ref.component)
  }

  /** @param {Component} component */
  static logComponentRefCount(component) {
    console.debug(
      "~~ CB REF COUNT",
      Cinnabun.isClient
        ? Cinnabun.componentReferences.length
        : component.cbInstance.serverComponentReferences.length,
      performance.now()
    )
  }

  /**
   * Registers runtime services.
   * @template Class
   * @param {...RuntimeService<Class>} services - The runtime services to register.
   */
  static registerRuntimeServices(...services) {
    Cinnabun.runtimeServices.push(...services)
  }

  /**
   * Retrieves the runtime service for the specified class.
   * @template Class
   * @param {ClassConstructor<any>} classRef - The reference to the class.
   * @returns {InstanceType<Class>} The runtime service instance.
   */
  static getRuntimeService(classRef) {
    return Cinnabun.runtimeServices.find((s) => s instanceof classRef)
  }
}
