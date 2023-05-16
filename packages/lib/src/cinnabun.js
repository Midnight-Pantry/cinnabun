"use strict"
import { Component } from "./component.js"
import { DomInterop } from "./domInterop.js"

export class Cinnabun {
  constructor() {
    /** @type {import("./types").WatchedElementRef[]} */
    let serverComponentReferences = []
    this.getServerComponentReferences = () => serverComponentReferences

    /** @param {import("./types").WatchedElementRef[]} newVal  */
    this.setServerComponentReferences = (newVal) =>
      (serverComponentReferences = newVal)

    /** @private @type {import("./types").ServerRequestData} */
    let serverRequest = {
      path: "/",
      data: {},
    }

    /** @param {import("./types").ServerRequestData} data */
    this.setServerRequestData = (data) => {
      serverRequest = data
    }

    /**
     * Retrieve server request data based on the provided keys path.
     * @template T - The type of the requested data.
     * @param {string} keysPath - The dot-separated keys path to retrieve the data.
     * @returns {T | undefined} - The requested data or undefined if not found.
     */
    this.getServerRequestData = (keysPath) => {
      const props = keysPath.split(".")
      /** @type {*} */
      let value = { ...serverRequest }
      for (let i = 0; i < props.length; i++) {
        value = value[props[i]]
        if (value === undefined) {
          return undefined
        }
      }
      return value
    }
  }
  /** @readonly @type {boolean} */
  // @ts-ignore
  static DEBUG_COMPONENT_REFCOUNT = false
  /** @readonly @type {boolean} */
  // @ts-ignore
  static isClient = "window" in globalThis

  // ~~~~~ CLIENT SINGLETON
  /** @type {Map<Element | ChildNode, number>} */
  static rootMap = new Map()

  /** @type {import("./types").WatchedElementRef[]} */
  static componentReferences = []

  /** @type {import("./types").ClassInstance<any>[]} */
  static runtimeServices = []

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
      : Cinnabun.getInstanceRef(component).getServerComponentReferences()
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
      cb.setServerComponentReferences(
        cb
          .getServerComponentReferences()
          .filter((c) => c.component !== component)
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

  /** @param {import("./types").WatchedElementRef} ref */
  static addComponentReference = (ref) => {
    if (Cinnabun.isClient) {
      Cinnabun.componentReferences.push(ref)
    } else {
      const cb = Cinnabun.getInstanceRef(ref.component)
      cb.setServerComponentReferences([
        ...cb.getServerComponentReferences(),
        ref,
      ])
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
        : Cinnabun.getInstanceRef(component).getServerComponentReferences()
            .length,
      performance.now()
    )
  }

  /**
   * Registers runtime services.
   * @param {import("./types").ClassInstance<any>[]} services - The runtime services to register.
   */
  static registerRuntimeServices(...services) {
    Cinnabun.runtimeServices.push(...services)
  }

  /**
   * Retrieves the runtime service for the specified class.
   * @template {any} Class
   * @param {import("./types").ClassConstructor<Class>} classRef - The reference to the class.
   * @returns {InstanceType<Class>} The runtime service instance.
   */
  static getRuntimeService(classRef) {
    return Cinnabun.runtimeServices.find((s) => s instanceof classRef)
  }
}
