"use strict"
import { Component } from "./component.js"
import { DomInterop } from "./domInterop.js"
export { h, fragment } from "./index.js"

export class Cinnabun {
  /** @readonly */
  static DEBUG_COMPONENT_REFCOUNT = false
  /** @readonly @type {boolean} */
  static isClient = "window" in globalThis

  // ~~~~~ CLIENT SINGLETON
  /** @type {Map<Element | ChildNode, number>} */
  static rootMap = new Map()

  /** @type {import("./types.js").WatchedElementRef[]} */
  static componentReferences = []

  /** @type {import("./types.js").ClassInstance<any>[]} */
  static runtimeServices = []

  // ~~~~~ SSR INSTANCE
  /** @private @type {import("./types.js").WatchedElementRef[]} */
  serverComponentReferences = []

  /** @private @type {import("./types.js").ServerRequestData} */
  serverRequest = {
    path: "/",
    data: {},
  }

  /** @param {import("./types.js").ServerRequestData} data */
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
    /** @type {*} */
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
      : Cinnabun.getInstanceRef(component).serverComponentReferences
  }

  /** @param {Component} component */
  static removeComponentReferences(component) {
    Cinnabun.removeComponentChildReferences(component)

    if (Cinnabun.isClient) {
      Cinnabun.componentReferences = Cinnabun.componentReferences.filter(
        (c) => c.component !== component
      )
    } else {
      const cb = Cinnabun.getInstanceRef(component)
      cb.serverComponentReferences = cb.serverComponentReferences.filter(
        (c) => c.component !== component
      )
    }
  }

  /**
   * @param {Component} component
   * @returns {Cinnabun}
   */
  static getInstanceRef(component) {
    const cb = component.cbInstance
    if (!cb) throw new Error("Failed to get Cinnabun instance ref")
    return cb
  }

  /** @param {Component} component */
  static removeComponentChildReferences(component) {
    for (const c of component.children) {
      if (Component.isComponent(c)) Cinnabun.removeComponentReferences(c)
    }
  }

  /** @param {import("./types.js").WatchedElementRef} ref */
  static addComponentReference = (ref) => {
    if (Cinnabun.isClient) {
      Cinnabun.componentReferences.push(ref)
    } else {
      Cinnabun.getInstanceRef(ref.component).serverComponentReferences.push(ref)
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
        : Cinnabun.getInstanceRef(component).serverComponentReferences.length,
      performance.now()
    )
  }

  /**
   * Registers runtime services.
   * @param {import("./types.js").ClassInstance<any>[]} services - The runtime services to register.
   */
  static registerRuntimeServices(...services) {
    Cinnabun.runtimeServices.push(...services)
  }

  /**
   * Retrieves the runtime service for the specified class.
   * @template {import("./types.js").ClassConstructor} Class
   * @param {import("./types.js").ClassConstructor<Class>} classRef - The reference to the class.
   * @returns {InstanceType<Class>} The runtime service instance.
   */
  static getRuntimeService(classRef) {
    return Cinnabun.runtimeServices.find((s) => s instanceof classRef)
  }
}
