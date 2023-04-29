# **Cinnabun**🥧

#### _An open-source, free, lightweight and (nearly) zero-dependancy web framework._

<br />

#### **Cinnabun comes with CSR and SSR out-of-the-box, and aims to provide powerful features by default.**

---

<br />

### **The following guide is optional - check out the new CLI tool at https://www.npmjs.com/package/create-cinnabun-app to get started quicker!**

<br />
<br />

# Getting Started - **CSR**

###### **_A guide to getting started with Cinnabun & Vite._**

<br />

- Run **`npm create vite`** to create a new Vite application
- Navigate to the new directory and run **`npm i cinnabun`** to add Cinnabun
- Add the following entry to your typescript config (tsconfig.json):

```json
{
  ...
  "jsx": "preserve"
  ...
}
```

- Create a Vite config (vite.config.ts) like so:

```js
import { defineConfig } from "vite"
import esBuildSettings from "cinnabun/settings.esbuild"

const { jsxInject, jsxFactory, jsxFragment } = esBuildSettings

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxInject,
    jsxFactory,
    jsxFragment,
  },
})
```

<br />

## **Configuration is done!** 👌

<br />

---

<br />

## **A simple application:**

<br />

_index.ts_

```js
import "./style.css"
import { Cinnabun } from "cinnabun"
import { App } from "./App"

const root = document.getElementById("app")!
Cinnabun.bake(App(), root)
```

_App.ts_

```js
import { createSignal } from "cinnabun"

export const App = () => {
  const count = createSignal(0)
  return (
    <>
      <h1>{count}</h1>
      <button onclick={() => count.value++}>Click me</button>
    </>
  )
}
```

<br />

## View more examples and comprehensive usage at https://github.com/Robby6Strings/cinnabun/tree/main/apps
