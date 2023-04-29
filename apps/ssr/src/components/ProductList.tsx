import * as Cinnabun from "cinnabun"
import { Suspense } from "cinnabun"
import { Either } from "cinnabun/types"
import { ServerPromise } from "cinnabun/ssr"

type ProductListResponse = Either<{ message: string }, { items: string[] }>

// async function $loadProductList(): Promise<ProductListResponse> {
//   if (Math.random() < 0.7) return { items: ["this", "was", "prefetched!"] }
//   return {
//     message: "Oops! Something went wrong 😢 (not really, just testing :P)",
//   }
// }
async function loadProductList(): ServerPromise<ProductListResponse> {
  if (Math.random() < 0.7) return { items: ["this", "was", "prefetched!"] }
  return {
    message: "Oops! Something went wrong 😢 (not really, just testing :P)",
  }
}

export const ProductList = () => {
  return (
    <Suspense prefetch promise={loadProductList}>
      {(loading: boolean, res?: ProductListResponse) => {
        if (res?.message) return <p>{res.message}</p>
        if (loading) return <p>loading...</p>
        return res?.items && <ul>{...res.items.map((c) => <li>{c}</li>)}</ul>
      }}
    </Suspense>
  )
}
