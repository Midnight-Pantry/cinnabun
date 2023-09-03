import * as Cinnabun from "cinnabun"
import { CodeBlock } from "./CodeBlock"
import {
  ClickOutsideListener,
  KeyboardListener,
  ViewportListener,
} from "cinnabun/listeners"
import { Suspense } from "cinnabun"
import { sleep } from "cinnabun/src/utils"

export const Components = () => {
  document.title = "Cinnabun - Components"
  const loadImage = async () => {
    const res = await fetch(
      "https://image.dummyjson.com/400x200/008080/ffffff?text=Hello+World!&fontFamily=cookie"
    )
    await sleep(1000)
    return res.blob()
  }
  return (
    <div>
      <h2>Components</h2>

      <ul>
        <li>
          <a href="#about">About Components</a>
        </li>
        <li>
          <a href="#routing">Routing</a>
        </li>
        <li>
          <a href="#listeners">Event Listeners</a>
          <ul>
            <li>
              <a href="#click-outside-listener">Click Outside</a>
            </li>
            <li>
              <a href="#keyboard-listener">Keyboard</a>
            </li>
            <li>
              <a href="#navigation-listener">Navigation</a>
            </li>
            <li>
              <a href="#viewport-listener">Viewport</a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#suspense">Suspense</a>
        </li>
        <li>
          <a href="#portal">Portal</a>
        </li>
        <li>
          <a href="#for">For</a>
        </li>
        <li>
          <a href="#rawhtml">RawHtml</a>
        </li>
      </ul>

      <h3 id="about">About Components</h3>
      <p>
        Components are the building blocks of your application. They are
        responsible for rendering the UI and handling user interactions.
      </p>

      <h3 id="routing">Routing</h3>
      <p>
        Cinnabun provides a simple, declarative API for routing. It is
        implemented using the HTML5 History API.
      </p>

      <CodeBlock
        code={`import { Route, Router, Link } from "cinnabun/router"
        
const App = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about-us">About Us</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
      </Router>
    </>
  )
}`}
      />

      <h3 id="listeners">Event Listeners</h3>
      <p>
        Cinnabun provides a simple, declarative API for adding event listeners.
      </p>
      <h4 id="click-outside-listener">Click Outside</h4>
      <p>
        The <code>ClickOutsideListener</code> component allows you to add a
        click outside listener to any element.
      </p>
      <CodeBlock
        code={`import { ClickOutsideListener } from "cinnabun/listeners"

const App = () => {
  return (
    <ClickOutsideListener
      tag="div"
      onCapture={() => {
        console.log("Clicked outside!")
      }}
    >
      Click outside of me!
    </ClickOutsideListener>
  )
}`}
      />
      <br />
      <div className="code-preview">
        <ClickOutsideListener
          tag="div"
          onCapture={() => {
            console.log("Clicked outside!")
          }}
        >
          Click outside of me!
        </ClickOutsideListener>
      </div>

      <h4 id="keyboard-listener">Keyboard</h4>
      <p>
        The <code>KeyboardListener</code> component allows you to listen to any
        keyboard combinations, or combinations originating from a specific
        element and it's children.
      </p>
      <CodeBlock
        code={`import { KeyboardListener } from "cinnabun/listeners"

const App = () => {
  return (
    <>
      <div>
        <KeyboardListener
          keys={["w", "a", "s", "d"]}
          onCapture={(keys) => console.log(keys)}
        />
        This fires when you press w, a, s, or d.
      </div>
      <div>
        <KeyboardListener
          keys={["1", "2", "3"]}
          onCapture={(keys) => console.log(keys)}
        >
          <input type="text" />
        </KeyboardListener>
        <br />
        This fires when you press 1, 2 or 3 while the input is focussed.
      </div>
    </>
  )
}`}
      />
      <br />
      <div className="code-preview">
        <KeyboardListener
          keys={["w", "a", "s", "d"]}
          onCapture={(keys) => console.log(keys)}
        />
        This fires when you press w, a, s, or d.
      </div>
      <br />
      <div className="code-preview">
        <KeyboardListener
          keys={["1", "2", "3"]}
          onCapture={(keys) => console.log(keys)}
        >
          <input type="text" />
        </KeyboardListener>
        <br />
        This fires when you press 1, 2 or 3 while the input is focussed.
      </div>

      <h4 id="navigation-listener">Navigation</h4>
      <p>
        The <code>NavigationListener</code> component allows you to listen to
        navigation events.
      </p>
      <CodeBlock
        code={`import { NavigationListener } from "cinnabun/listeners"

const App = () => {
  return (
    <NavigationListener
      onCapture={(path) => console.log(path)}
    />
  )
}`}
      />

      <h4 id="viewport-listener">Viewport</h4>
      <p>
        The <code>ViewportListener</code> component allows you to listen to
        viewport events.
      </p>
      <CodeBlock
        code={`import { ViewportListener } from "cinnabun/listeners"

const App = () => {
  return (
    <ViewportListener
      onCapture={(viewport) => console.log(viewport)}
      throttleRateMs={1000 / 60}
    />
  )

  // viewport = {
  //   width: number,
  //   height: number,
  //   scrollX: number,
  //   scrollY: number,
  //   landscape: boolean,
  // }

}`}
      />

      <h3 id="suspense">Suspense</h3>
      <p>
        The <code>Suspense</code> component allows you to suspend rendering
        while data is being fetched.
      </p>
      <CodeBlock
        code={`import { Suspense } from "cinnabun"
const loadImage = async () => {
  const res = await fetch(
    "https://image.dummyjson.com/400x200/008080/ffffff?text=Hello+World!&fontFamily=cookie"
  )
  return res.blob()
}

const App = () => {
  return (
    <Suspense promise={loadImage}>
      {(loading, data) => {
        if (loading) {
          return <div>Loading...</div>
        }

        return <img src={urlCreator.createObjectURL(data)} >
      }}
    </Suspense>
  )
}`}
      />
      <br />
      <div className="code-preview" style="display:flex;justify-content:center">
        <Suspense promise={loadImage}>
          {(loading: boolean, data: Blob) => {
            if (loading) {
              return <div>Loading...</div>
            }

            return <img src={URL.createObjectURL(data)} />
          }}
        </Suspense>
      </div>
    </div>
  )
}
