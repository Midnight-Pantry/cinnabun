import * as Cinnabun from "cinnabun"
import { CodeBlock } from "./CodeBlock"

export const About = () => {
  const showText = new Cinnabun.Signal(true)
  const clicks = new Cinnabun.Signal(0)
  return (
    <div>
      <p className="text-subtext">
        A lightweight framework/library for building reactive web applications
        with no (zero!) dependencies sent to the client and weighing less than
        5kb.
      </p>
      <br />
      <hr style="opacity:.3" />
      <br />
      <h2>Why another framework?</h2>
      <p>
        I wanted to build a framework that was easy to use, understand and
        extend. With a moderate understanding of JS and a few basic pub/sub
        techniques, you can build reactive, declaritive, and performant
        full-stack web applications with Cinnabun.
      </p>
      <section>
        <h2>How does it work?</h2>
        <p>
          Cinnabun uses the Signal concept thoroughly. <i>Everywhere.</i> <br />
          A signal is a reactive object that can be subscribed to and updated.
          When a signal is updated, it will notify all of its subscribers.
        </p>
        <CodeBlock
          code={`class SignalExample {
  constructor(initialValue) {
    this.value = initialValue // the value of the signal
    this.subscribers = [] // array of functions
  }

  get value() {
    return this._value
  }
  set value(newValue) {
    this._value = newValue
    this.notify()
  }

  notify() {
    this.subscribers.forEach((subscriber) => {
      subscriber(this._value)
    })
  }
  
  subscribe(func) {
    this.subscribers.add(func)
    return () => this.unsubscribe(func)
  }

  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter((subscriber) => {
      return subscriber !== fn
    })
  }
}`}
        />
        <p>In their most basic form, signals can be quite powerful.</p>
        <CodeBlock
          code={`const mySignal = new Signal("Hello, World!")

mySignal.subscribe((value) => {
  console.log(value) // logs "Hello, World!"
}

mySignal.value = "Goodbye, World!" // logs "Goodbye, World!"`}
        />

        <p>
          In Cinnabun, signals are used to compose simple{" "}
          <i>if-this-then-that</i> or <i>when-this-then-that</i> user
          interfaces. They can be declared anywhere, and modified any how.{" "}
          <br />
          <br />
          Signals can be used to control the visibility of elements, the value
          of inputs, the content of elements, and more.
          <br />
          <br />A signal can be <i>'watched'</i> (subscribed to) by an element,
          where you can <i>'bind'</i> the specified element attribute or
          component property to the result of an expression. If you want to use
          the signal's value for an element attribute, it can be automatically
          bound using the shorthand syntax.
        </p>
        <div className="code-preview ">
          <div className="flex gap-sm align-items-center">
            <input
              type="checkbox"
              checked={showText}
              onchange={(e: Event) => {
                showText.value = (e.target as HTMLInputElement).checked
                clicks.value++
              }}
            />
            <span watch={showText} bind:visible={() => showText.value}>
              Hello, World!
            </span>
          </div>
          {clicks} clicks
        </div>
        <CodeBlock
          code={`const showText = new Signal(true)
const clicks = new Signal(0)

const App = () => {
  return (
    <>
      <input
        type="checkbox"
        checked={showText}
        onchange={(e) => {
          showText.value = e.target.checked
          clicks.value++
        }}
      />
      {/* //Alternatively: 
      <input
        type="checkbox"
        watch={showText}
        bind:checked={() => showText.value}
        onchange={(e) => {
          showText.value = e.target.checked
          clicks.value++
        }}
      /> */}
      <span watch={showText} bind:visible={() => showText.value}>
        Hello, World!
      </span>
      <br />
      {clicks} clicks
    </>
  )
}
`}
        />
      </section>
    </div>
  )
}
