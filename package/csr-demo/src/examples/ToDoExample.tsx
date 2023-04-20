import { createSignal } from "cinnabun"

interface ToDoItem {
  text: string
  done: boolean
}
const todos = createSignal<ToDoItem[]>([
  { text: "Make a coffee", done: false },
  { text: "Write a cool new app", done: false },
])

const ToDoList = () => {
  const removeToDo = (idx: number) => {
    todos.value.splice(idx, 1)
    todos.value = todos.value
  }
  return (
    <>
      {...todos.value.map((item, i) => (
        <li>
          {item.text} <input type="checkbox" onChange={() => removeToDo(i)} />
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
        style={{ marginBottom: "1rem" }}
        watch={todos}
        bind:children={() => [ToDoList]}
      />
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
    </div>
  )
}
