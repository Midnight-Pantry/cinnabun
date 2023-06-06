import * as Cinnabun from "cinnabun"
import "./styles/todo-list.css"
import { For, createSignal, computed } from "cinnabun"
import { generateUUID } from "./utils"
import * as Icons from "./icons"
import { IconButton } from "./IconButton"

interface ToDoItem {
  text: string
  id: string
  completed: boolean
}

const todos = createSignal<ToDoItem[]>([
  {
    text: "Make a coffee",
    id: "6303e923-2369-4ff8-9bd8-3a79770defba",
    completed: false,
  },
  {
    text: "Write a cool new app",
    id: "8210de9d-8abb-46ab-9423-781b4666e7d1",
    completed: false,
  },
])

const completedTodos = computed<ToDoItem[]>(todos, () =>
  todos.value.filter((item) => item.completed)
)
const pendingTodos = computed<ToDoItem[]>(todos, () =>
  todos.value.filter((item) => !item.completed)
)

export const ToDoExample = () => {
  const inputVal = createSignal<string>("")
  const addToDo = () => {
    todos.value = [
      ...todos.value,
      { text: inputVal.value, id: generateUUID(), completed: false },
    ]
    inputVal.value = ""
  }
  const removeToDo = (id: string) => {
    todos.value = todos.value.filter((item) => item.id !== id)
  }

  const toggleTodo = (id: string, val: boolean = true) => {
    todos.value = todos.value.map((item) => {
      if (item.id === id) {
        item.completed = val
      }
      return item
    })
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    addToDo()
  }

  const handleChange = (e: Event, id: string) => {
    const target = e.target as HTMLInputElement
    todos.value = todos.value.map((item) => {
      if (item.id === id) {
        item.text = target.value
      }
      return item
    })
  }

  return (
    <form onsubmit={handleSubmit}>
      <div
        watch={completedTodos}
        bind:visible={() => completedTodos.value.length > 0}
      >
        <h2>Completed ({() => completedTodos.value.length})</h2>
        <ul className="todo-list completed">
          <For each={completedTodos}>
            {(item: ToDoItem) => (
              <li key={item.id}>
                <span>{item.text}</span>
                <IconButton
                  type="button"
                  onclick={() => toggleTodo(item.id, false)}
                >
                  <Icons.UndoIcon color="#aaa" color:hover="orange" />
                </IconButton>
              </li>
            )}
          </For>
        </ul>
      </div>
      <div
        watch={pendingTodos}
        bind:visible={() => pendingTodos.value.length > 0}
      >
        <h2>Pending ({() => pendingTodos.value.length})</h2>
        <ul className="todo-list">
          <For each={pendingTodos}>
            {(item: ToDoItem) => (
              <li key={item.id}>
                <input
                  type="text"
                  value={() => item.text}
                  onkeyup={(e: Event) => handleChange(e, item.id)}
                />
                <IconButton type="button" onclick={() => toggleTodo(item.id)}>
                  <Icons.CheckIcon color="#aaa" color:hover="green" />
                </IconButton>
                <IconButton type="button" onclick={() => removeToDo(item.id)}>
                  <Icons.TrashIcon color="#aaa" color:hover="orangered" />
                </IconButton>
              </li>
            )}
          </For>
        </ul>
      </div>

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
        <IconButton watch={inputVal} bind:disabled={() => !inputVal.value}>
          <Icons.PlusIcon color="#aaa" color:hover="white" />
        </IconButton>
      </div>
    </form>
  )
}
