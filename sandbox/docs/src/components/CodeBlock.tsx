import * as Cinnabun from "cinnabun"

import Prism from "prismjs"

export const CodeBlock = (props: { code: string }) => {
  const ref = Cinnabun.useRef()
  const html = Prism.highlight(
    props.code,
    Prism.languages.javascript,
    "javascript"
  )
  return (
    <pre
      className="code-block"
      ref={ref}
      onMounted={() => {
        if (ref.value) {
          ref.value.innerHTML = html
        }
      }}
    ></pre>
  )
}
