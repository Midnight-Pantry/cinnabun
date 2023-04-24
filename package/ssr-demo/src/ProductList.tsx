import * as Cinnabun from "cinnabun"
import { Suspense } from "cinnabun"
import { Either } from "cinnabun/types"

type ProductListResponse = Either<{ message: string }, { items: string[] }>

async function $loadProductList(): Promise<ProductListResponse> {
  if (Math.random() < 0.7) return { items: ["this", "was", "prefetched!"] }
  return {
    message: "Oops! Something went wrong 😢 (not really, just testing :P)",
  }
}

export const ProductList = () => {
  return (
    <Suspense prefetch promise={$loadProductList}>
      {(res: ProductListResponse) => {
        if ("message" in res) return <p>{res.message}</p>
        return <ul>{...res.items.map((c) => <li>{c}</li>)}</ul>
      }}
    </Suspense>
  )
}
