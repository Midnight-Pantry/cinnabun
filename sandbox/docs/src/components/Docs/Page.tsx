import * as Cinnabun from "cinnabun"
import { useRef } from "cinnabun"
import Prism from "prismjs"

const CodeBlock = (props: { code: string }) => {
  const ref = useRef()
  const html = Prism.highlight(
    props.code,
    Prism.languages.javascript,
    "javascript"
  )
  return (
    <pre
      className="code-block"
      ref={ref}
      onMounted={() => {
        if (ref.value) {
          ref.value.innerHTML = html
        }
      }}
    ></pre>
  )
}

export const Docs = () => {
  const showText = new Cinnabun.Signal(true)

  return (
    <section>
      <div className="page-container">
        <div className="page-title">
          <h1>Docs</h1>
        </div>
        <div className="page-content">
          <div className="page-content__main">
            <section>
              <h2>What is Cinnabun?</h2>
              <p>
                Cinnabun is a lightweight library for building reactive web
                applications with no (zero!) dependencies sent to the client and
                weighing less than 5kb.
              </p>
            </section>
            <section>
              <h2>Why another framework?</h2>
              <p>
                I wanted to build a framework that was easy to use, understand
                and extend. With a moderate understanding of JS and a few basic
                pub/sub techniques, you can build reactive, declaritive, and
                performant full-stack web applications with Cinnabun.
              </p>
            </section>
            <section>
              <h2>How does it work?</h2>
              <p>
                Cinnabun uses the Signal concept thoroughly. <i>Everywhere.</i>{" "}
                <br />A signal is a reactive object that can be subscribed to
                and updated. When a signal is updated, it will notify all of its
                subscribers.
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
                In Cinnabun, signals are used to compose simple{" "}
                <i>if-this-then-that</i> or <i>when-this-then-that</i> user
                interfaces. They can be declared anywhere, and modified any how.{" "}
                <br />
              </p>
              <CodeBlock
                code={`const showText = new Signal(true)
const Greeting = () => {
  return (
    <span watch={showText} bind:visible={() => showText.value}>
      Hello, World!
    </span>
  );
}
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
      <Greeting />
    </>
  )
}
`}
              />
              <div className="code-preview flex gap align-items-center">
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
        </div>
      </div>
    </section>
  )
}
