import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"

interface ToDoItem {
  text: string
  done: boolean
}
const todos = createSignal<ToDoItem[]>([
  { text: "Make a coffee", done: false },
  { text: "Write a cool new app", done: false },
])

export const ToDoExample = () => {
  const inputVal = createSignal<string>("")
  const addToDo = () => {
    todos.value = [...todos.value, { text: inputVal.value, done: false }]
    inputVal.value = ""
  }
  const removeToDo = (idx: number) => {
    todos.value.splice(idx, 1)
    todos.value = todos.value
  }

  return (
    <div>
      <div watch={todos} bind:render={() => true}>
        {() => (
          <ul>
            {...todos.value.map((item, i) => (
              <li>
                {item.text}
                <input type="checkbox" onChange={() => removeToDo(i)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <br />
      <input
        placeholder="Add a new item"
        watch={inputVal}
        bind:value={() => inputVal.value}
        onChange={(e) => {
          inputVal.value = (e.target as HTMLInputElement).value
        }}
      />
      <button
        watch={inputVal}
        bind:disabled={() => !inputVal.value}
        onClick={() => addToDo()}
      >
        Add
      </button>
      <br />
      <span
        watch={todos}
        bind:innerText={() =>
          `${todos.value.length} item${todos.value.length == 1 ? "" : "s"}`
        }
      />
    </div>
  )
}
