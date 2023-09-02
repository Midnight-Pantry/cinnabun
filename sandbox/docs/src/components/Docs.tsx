import * as Cinnabun from "cinnabun"
import { CodeBlock } from "./CodeBlock"

export const Docs = () => {
  const showText = new Cinnabun.Signal(true)

  return (
    <div>
      <h1 style="margin-bottom:0">Cinnabun</h1>
      <p className="text-subtext">
        A lightweight library for building reactive web applications with no
        (zero!) dependencies sent to the client and weighing less than 5kb.
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
          code={`class Signal {
  constructor(initialValue) {
    this.value = initialValue
    this.subscribers = []
  }

  subscribe(fn) {
    this.subscribers.push(fn)
    fn(this.value)
  }

  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter((subscriber) => {
      return subscriber !== fn
    })
  }

  update(newValue) {
    this.value = newValue
    this.subscribers.forEach((subscriber) => {
      subscriber(this.value)
    })
  }
}`}
        />
        <p>
          In Cinnabun, signals can be used to compose simple{" "}
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
        <CodeBlock
          code={`const showText = new Signal(true) // this could live anywhere :D

const App = () => {
  return (
    <>
      <input
        type="checkbox"
        checked={showText}
        onchange={(e: Event) => {
          showText.value = (e.target as HTMLInputElement).checked
        }}
      />
      {/* //Alternatively: 
      <input
        type="checkbox"
        watch={showText}
        bind:checked={() => showText.value}
        onchange={(e: Event) => {
          showText.value = (e.target as HTMLInputElement).checked
        }}
      /> */}
      <span watch={showText} bind:visible={() => showText.value}>
        Hello, World!
      </span>
    </>
  )
}
`}
        />
        <div className="code-preview flex gap-sm align-items-center">
          <input
            type="checkbox"
            checked={showText}
            onchange={(e: Event) => {
              showText.value = (e.target as HTMLInputElement).checked
            }}
          />
          <span watch={showText} bind:visible={() => showText.value}>
            Hello, World!
          </span>
        </div>
      </section>
    </div>
  )
}
