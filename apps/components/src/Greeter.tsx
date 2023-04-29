import * as Cinnabun from "cinnabun"
import { Signal } from "cinnabun"

function getTextAndGif(val: number): [string, string] {
  return val === 69
    ? [
        "You dirty dog!",
        "https://media.tenor.com/yB2jeWz2U8kAAAAd/alan-partridge-dirty.gif",
      ]
    : val === 0 || val % 3 === 0
    ? [
        "Hello world!",
        "https://media.tenor.com/mGgWY8RkgYMAAAAC/hello-world.gif",
      ]
    : val % 2 === 0
    ? ["Hi dad!", "https://media.tenor.com/AUnlZDJSvpcAAAAM/daddy-excited.gif"]
    : ["Hi mom!", "https://media2.giphy.com/media/hmZtValohxXby/giphy.gif"]
}

export const Greeter = ({ count }: { count: Signal<number> }) => {
  return (
    <div
      id="greeter"
      watch={count}
      bind:children={() => {
        const [text, url] = getTextAndGif(count.value)
        return [
          <>
            <img height="200" src={url} />
            <p>{text}</p>
          </>,
        ]
      }}
    />
  )
}
