import * as Cinnabun from "cinnabun"
import {
  ContextExample,
  NestedRoutingExample,
  SignalsExample,
  SuspenseExample,
  ToDoExample,
} from "@cinnabun/example-components"
import { Route, Router } from "cinnabun/router"
import { pathStore } from "./state.js"
import { ProductList } from "./components/ProductList.jsx"
import { AuthButtons } from "./components/AuthButtons.jsx"
import { Nav } from "./components/Nav.jsx"
import { Chat } from "./components/chat/Chat.jsx"
import {
  NotificationTray,
  addNotification,
} from "./components/Notifications.jsx"

const PerfTest = ({ n }: { n: number }) => {
  return (
    <ul>
      {...Array(n)
        .fill(0)
        .map((_, i) => <li>{i}</li>)}
    </ul>
  )
}

if (Cinnabun.Cinnabun.isClient) {
  setTimeout(() => {
    addNotification({
      text: "Eyyyyyy 😁",
    })
  }, 1000)
}

export const App = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <h1>Cinnabun JS - SSR</h1>
      <br />
      <ProductList />
      <Nav />

      <main style={{ textAlign: "center", flexGrow: "1" }}>
        <Router store={pathStore}>
          <Route path="/" component={<SignalsExample />} />
          <Route path="/context" component={<ContextExample />} />
          <Route path="/suspense" component={<SuspenseExample />} />
          <Route
            path="/nested-routing"
            component={<NestedRoutingExample {...{ pathStore }} />}
          />
          <Route path="/todo" component={<ToDoExample />} />
          <Route path="/perf" component={<PerfTest n={1_000} />} />
          <Route path="/chat" component={<Chat />} />
        </Router>
      </main>
      <br />
      <AuthButtons />
      <br />
      <NotificationTray />
    </div>
  )
}
