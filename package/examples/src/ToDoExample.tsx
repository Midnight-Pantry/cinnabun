import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"

interface ToDoItem {
  text: string
}
const todos = createSignal<ToDoItem[]>([
  { text: "Make a coffee" },
  { text: "Write a cool new app" },
  { text: "asdfg" },
])

export const ToDoExample = () => {
  const inputVal = createSignal<string>("")
  const addToDo = () => {
    todos.value = [...todos.value, { text: inputVal.value }]
    inputVal.value = ""
  }
  const removeToDo = (idx: number) => {
    todos.value.splice(idx, 1)
    todos.value = todos.value
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    addToDo()
  }

  return (
    <form onsubmit={handleSubmit}>
      <ul className="todo-list" watch={todos} bind:render>
        {() => (
          <>
            {...todos.value.map((item, i) => (
              <li>
                <input
                  type="checkbox"
                  id={`todo-item-${i}`}
                  onchange={() => removeToDo(i)}
                />
                <label htmlFor={`todo-item-${i}`}>{item.text}</label>
              </li>
            ))}
          </>
        )}
      </ul>
      <br />
      <input
        placeholder="Add a new item"
        watch={inputVal}
        bind:value={() => inputVal.value}
        onkeyup={(e: Event) => {
          inputVal.value = (e.target as HTMLInputElement).value
        }}
      />
      <button watch={inputVal} bind:disabled={() => !inputVal.value}>
        Add
      </button>
      <br />
      <span
        watch={todos}
        bind:innerText={() =>
          `${todos.value.length} item${todos.value.length == 1 ? "" : "s"}`
        }
      />
    </form>
  )
}
