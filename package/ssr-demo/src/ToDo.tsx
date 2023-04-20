import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"

interface ToDoItem {
  text: string
  done: boolean
}
const todos = createSignal<ToDoItem[]>([{ text: "Test", done: false }])

const ToDoItems = () => {
  const removeToDo = (idx: number) => {
    todos.value.splice(idx, 1)
    todos.value = todos.value
  }
  return (
    <>
      {...todos.value.map((item, i) => (
        <li>
          {item.text}
          <input type="checkbox" onChange={() => removeToDo(i)} />
        </li>
      ))}
    </>
  )
}

export const ToDo = () => {
  const inputVal = createSignal<string>("")
  const addToDo = () => {
    todos.value = [...todos.value, { text: inputVal.value, done: false }]
    inputVal.value = ""
  }

  return (
    <div>
      <ul
        watch={todos}
        bind:render={() => {
          debugger
          return todos.value.length > 0
        }}
      >
        {() => <ToDoItems />}
      </ul>
      <input
        placeholder="write a new todo"
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
    </div>
  )
}
