import * as Cinnabun from "cinnabun"
import { Suspense } from "cinnabun"
import { Either } from "cinnabun/types"
import { sleep } from "cinnabun/utils"

type ProductCategoriesResponse = Either<{ error: Error }, { data: string[] }>

async function getProductCategories(): Promise<ProductCategoriesResponse> {
  try {
    const res = await fetch("https://dummyjson.com/products/categories")
    if (!res.ok)
      throw new Error(res.statusText ?? "Failed to load product categories")

    const data = await res.json()
    return { data }
  } catch (error) {
    return { error: error as Error }
  }
}

export const SuspenseExample = ({ cache }: { cache?: boolean }) => {
  return (
    <Suspense cache={cache} promise={getProductCategories}>
      {(loading: boolean, res?: ProductCategoriesResponse) => {
        if (res?.error) return <p>{res.error}</p>
        if (loading) return <p>loading...</p>

        return res && <ul>{...res.data.map((c) => <li>{c}</li>)}</ul>
      }}
    </Suspense>
  )
}
