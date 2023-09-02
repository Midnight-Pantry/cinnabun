import * as Cinnabun from "cinnabun"
import Prism from "prismjs"

export const CodeBlock = (props: { code: string }) => {
  return (
    <Cinnabun.RawHtml>
      {`<pre class="code-block"><code>${Prism.highlight(
        props.code,
        Prism.languages.javascript,
        "javascript"
      )}</code></pre>`}
    </Cinnabun.RawHtml>
  )
}
