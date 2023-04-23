# **Cinnabun JS**🥧

#### _Your next app will rise_

---

##### \*_As of current, the project's build settings only work with Vite._

<br >

# Getting Started

Run the following to add Cinnabun:

`npm i cinnabun`

Add the following entry to your typescript config (tsconfig.json):

```json
{
  ...
  "jsx": "preserve"
  ...
}
```

Your Vite config (vite.config.ts) should use Cinnabun's BuildSettings as per the following:

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

With your compilation settings configured, you can create a simple Cinnabun application as per the following:
<br />
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
      <button onClick={() => count.value++}>Click me</button>
    </>
  )
}
```

<br>

# But what if I want to create a _real_ application?

Cinnabun comes out of the box with support for two-way-binding, suspenseful components and more.

<br>

### **Suspense:**

```ts
import { Suspense } from "cinnabun"
import { Either } from "cinnabun/types"
import { sleep } from "cinnabun/utils"

type ProductCategoriesResponse = Either<{ error: Error }, { data: string[] }>

async function getProductCategories(): Promise<ProductCategoriesResponse> {
  try {
    const res = await fetch("https://dummyjson.com/products/categories")
    if (!res.ok)
      throw new Error(res.statusText ?? "Failed to load product categories")
    await sleep(500)

    const data = await res.json()
    return { data }
  } catch (error) {
    return { error: error as Error }
  }
}

export const SuspenseExample = () => {
  return (
    <Suspense promise={getProductCategories}>
      {(loading: boolean, res?: ProductCategoriesResponse) => {
        if (res?.error) return <p>{res.error}</p>
        if (loading) return <p>loading...</p>

        return res && <ul>{...res.data.map((c) => <li>{c}</li>)}</ul>
      }}
    </Suspense>
  )
}
```

<br>

### **Two-way binding:**

```js
import { createSignal } from "cinnabun"

const TwoWayBindingExample = () => {
  const count = createSignal(0)

  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => count.value++}>click me</button>
      <input
        value={count}
        onChange={(e) => {
          count.value = parseInt((e.target as HTMLInputElement).value)
        }}
      />
    </>
  )
}
```
