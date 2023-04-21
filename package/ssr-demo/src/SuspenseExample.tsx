import * as Cinnabun from "cinnabun"
import { sleep } from "cinnabun/utils"
import { Either } from "cinnabun/src/types"

type ProductCategoriesResponse = Either<{ error: Error }, { data: string[] }>

async function getProductCategories(): Promise<ProductCategoriesResponse> {
  try {
    console.log("getProductCategories")
    const res = await fetch("https://dummyjson.com/products/categories")
    if (!res.ok)
      throw new Error(res.statusText ?? "Failed to load product categories")
    await sleep(500)

    const data = await res.json()
    return { data }
  } catch (error) {
    return { error: error as Error }
  }
}

export const SuspenseExample = () => {
  return (
    <Cinnabun.Suspense cache promise={getProductCategories}>
      {(loading: boolean, res?: ProductCategoriesResponse) => {
        if (res?.error) return <p>{res.error}</p>
        if (loading) return <p>loading...</p>

        return res && <ul>{...res.data.map((c) => <li>{c}</li>)}</ul>
      }}
    </Cinnabun.Suspense>
  )
}
