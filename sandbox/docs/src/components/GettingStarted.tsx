import * as Cinnabun from "cinnabun"
import { CodeBlock } from "./CodeBlock"

export const GettingStarted = () => {
  return (
    <section id="getting-started">
      <h2 style="margin-top:0">Getting Started</h2>
      <small style="display:block;margin-bottom:.5rem;">
        <i>
          Recommended: use the{" "}
          <a href="https://www.npmjs.com/package/create-cinnabun-app">
            quick-start CLI tool
          </a>{" "}
          to quickly scaffold a new project.
        </i>
      </small>
      <Instructions />
    </section>
  )
}

const Instructions = () => {
  const projectType = Cinnabun.createSignal<"CSR" | "SSR">("CSR")

  return (
    <div className="tab-box">
      <div className="tab-box__tabs">
        <button
          watch={projectType}
          bind:className={() => (projectType.value === "CSR" ? "active" : "")}
          onclick={() => (projectType.value = "CSR")}
        >
          Client-Side Rendered
        </button>
        <button
          watch={projectType}
          bind:className={() => (projectType.value === "SSR" ? "active" : "")}
          onclick={() => (projectType.value = "SSR")}
        >
          Server-Side Rendered
        </button>
      </div>
      <div watch={projectType} bind:children className="tab-box__content">
        {() =>
          projectType.value === "CSR" ? (
            <CsrInstructions />
          ) : (
            <SsrInstructions />
          )
        }
      </div>
    </div>
  )
}

const CsrInstructions = () => {
  return (
    <div>
      <p style="margin-top:0">
        Run the following commands to get started using Vite as the JSX
        transpiler + development server:
      </p>
      <ul>
        <li>
          Run{" "}
          <strong>
            <code className="code-preview">npm create vite</code>
          </strong>{" "}
          to create a new Vite application
        </li>
        <li>
          Navigate to the new directory and run{" "}
          <strong>
            <code className="code-preview">npm i cinnabun</code>
          </strong>{" "}
          to add Cinnabun
        </li>
        <li>
          Add the following entry to your typescript config (tsconfig.json):
          <CodeBlock
            code={`{
  ...
  "jsx": "preserve"
  ...
}`}
          />
        </li>
        <li>
          Create a Vite config (vite.config.ts) like so:
          <CodeBlock
            code={`import { defineConfig } from 'vite'
              
export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxFactory: "Cinnabun.h",
    jsxFragment: "Cinnabun.fragment",
  },
})`}
          />
        </li>
        <li>
          Create a new file (App.tsx) and add the following code:
          <CodeBlock
            code={`import * as Cinnabun from "cinnabun"

const App = () => {
  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  )
}`}
          />
        </li>
        <li>
          Import the App component into your main.tsx file and render it:
          <CodeBlock
            code={`import { Cinnabun } from "cinnabun"
import { App } from "./App"

const root = document.getElementById("app")!
Cinnabun.bake(App(), root)`}
          />
        </li>
        <li>
          Run{" "}
          <strong>
            <code className="code-preview">npm run dev</code>
          </strong>{" "}
          to start the dev server
        </li>
      </ul>
      <br />
      <hr style="opacity:.3" />
      <i className="text-lg" style="display:block;margin:0;text-align:center;">
        Configuration is done! 👌
      </i>
    </div>
  )
}

const SsrInstructions = () => {}
