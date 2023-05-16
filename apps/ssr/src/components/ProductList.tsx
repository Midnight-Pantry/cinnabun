import * as Cinnabun from "cinnabun"
import { Suspense } from "cinnabun"
import { Either, ServerPromise } from "cinnabun/types"

type ProductListResponse = Either<{ message: string }, { items: string[] }>

async function loadProductList(): ServerPromise<ProductListResponse> {
  return { items: ["this", "was", "prefetched!"] }
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
