import * as Cinnabun from "cinnabun"
import { For, createSignal } from "cinnabun"

const generateUUID = () => {
  // Public Domain/MIT
  var d = new Date().getTime() //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0 //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0
      d = Math.floor(d / 16)
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0
      d2 = Math.floor(d2 / 16)
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
  })
}

interface ToDoItem {
  text: string
  id: string
}
const todos = createSignal<ToDoItem[]>([
  { text: "Make a coffee", id: "6303e923-2369-4ff8-9bd8-3a79770defba" },
  { text: "Write a cool new app", id: "8210de9d-8abb-46ab-9423-781b4666e7d1" },
])

export const SmartToDoExample = () => {
  const inputVal = createSignal<string>("")
  const addToDo = () => {
    todos.value = [...todos.value, { text: inputVal.value, id: generateUUID() }]
    inputVal.value = ""
  }
  const removeToDo = (id: string) => {
    todos.value = todos.value.filter((item) => item.id !== id)
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    addToDo()
  }

  return (
    <form onsubmit={handleSubmit}>
      <ul className="todo-list">
        <For each={todos}>
          {(item: ToDoItem) => (
            <li key={item.id}>
              <input
                type="checkbox"
                id={`todo-item-${item.id}`}
                onchange={() => removeToDo(item.id)}
              />
              <label htmlFor={`todo-item-${item.id}`}>{item.text}</label>
            </li>
          )}
        </For>
      </ul>
      <br />
      <div style="display:flex; gap:0.5rem">
        <input
          placeholder="Add a new item"
          watch={inputVal}
          bind:value={() => inputVal.value}
          onkeyup={(e: Event) => {
            inputVal.value = (e.target as HTMLInputElement).value
          }}
          onMounted={(self) => self.element?.focus()}
        />
        <button watch={inputVal} bind:disabled={() => !inputVal.value}>
          Add
        </button>
      </div>
      <br />
      <span watch={todos} bind:render>
        {() =>
          `${todos.value.length} item${todos.value.length == 1 ? "" : "s"}`
        }
      </span>
    </form>
  )
}
