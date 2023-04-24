import * as Cinnabun from "cinnabun"
import { Suspense } from "cinnabun"
import { Either } from "cinnabun/types"

type ProductListResponse = Either<
  { error: { message: string } },
  { items: string[] }
>

/**
 * @Server
 */

async function loadProductList(): Promise<ProductListResponse> {
  if (Math.random() < 0.5) return { items: ["t-shirt", "sweater", "jeans"] }
  return { error: { message: "Oops! Something went wrong 😢" } }
}

/**
 * @Client
 */

export const ProductList = () => {
  return (
    <Suspense prefetch promise={loadProductList}>
      {(res: ProductListResponse) => {
        if (res.error) return <p>{res.error.message}</p>
        return <ul>{...res.items.map((c) => <li>{c}</li>)}</ul>
      }}
    </Suspense>
  )
}

// export const ClientProductList = () => {
//   return (
//     <Suspense promise={loadProductList}>
//       {(loading?: boolean, res?: ProductListResponse) => {
//         if (loading) return <p>loading...</p>
//         if (res?.error) return <p>{res.error.message}</p>
//         return res && <ul>{...res.items.map((c) => <li>{c}</li>)}</ul>
//       }}
//     </Suspense>
//   )
// }
