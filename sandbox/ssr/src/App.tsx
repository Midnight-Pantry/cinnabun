import * as Cinnabun from "cinnabun"
import {
  ContextExample,
  FCWithChildrenExample,
  LazyListExample,
  NestedRoutingExample,
  SignalsExample,
  ToDoExample,
  SuspenseExample,
} from "@cinnabun/example-components"
import { Route, Router } from "cinnabun/router"
import { ProductList } from "./components/ProductList"
import { AuthButtons } from "./components/AuthButtons"
import { Nav } from "./components/Nav"
import { Chat } from "./components/chat/Chat"
import { NotificationTray } from "./components/Notifications"
import { Logo } from "./Logo"
import { Portal } from "./components/Portal"

const PerfTest = ({ n }: { n: number }) => {
  return (
    <ul>
      {Array(n)
        .fill(0)
        .map((_, i) => (
          <li>{i}</li>
        ))}
    </ul>
  )
}

export const App = () => {
  return (
    <div style="display: flex; min-height: 100vh">
      <div style="display: flex; gap: 1rem">
        <h1>Cinnabun JS - SSR</h1>
        <Logo />
      </div>
      <br />
      <ProductList />
      <Nav />

      <main style="text-align:center; flex-grow: 1;">
        <Router>
          <Route path="/" component={<SignalsExample />} />
          <Route path="/context" component={<ContextExample />} />
          <Route path="/suspense" component={<SuspenseExample />} />
          <Route path="/nested-routing" component={<NestedRoutingExample />} />
          <Route path="/todo" component={<ToDoExample />} />
          <Route path="/perf" component={<PerfTest n={1_000} />} />
          <Route path="/chat" component={<Chat />} />
          <Route
            path="/fc-with-children"
            component={
              <FCWithChildrenExample>
                <h4>This is a Functional Component child!</h4>
              </FCWithChildrenExample>
            }
          />
          <Route path="/lazy-list" component={<LazyListExample />} />
        </Router>
      </main>
      <br />
      <AuthButtons />
      <br />
      <Portal>
        <NotificationTray />
      </Portal>
    </div>
  )
}
