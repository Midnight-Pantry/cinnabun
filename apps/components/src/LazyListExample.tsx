import * as Cinnabun from "cinnabun"
import "./styles/card-list.css"
import { For } from "cinnabun"
import { Suspense, createSignal } from "cinnabun"
import { ProductAPIResponse, Product } from "./types/products"
import { sleep } from "cinnabun/utils"

type UrlParams = {
  skip: number
  limit: number
}

const products = createSignal<Product[]>([])
const loadingMore = createSignal<boolean>(false)
const args = createSignal<UrlParams>({ skip: 0, limit: 3 })

args.subscribe((v) => {
  if (v.skip === 0) return // skip initial load, this is handled by Suspense
  loadNextProducts()
})

async function loadNextProducts(): Promise<void> {
  loadingMore.value = true
  // simulate network latency
  await sleep(500)
  const res = await getProducts()
  loadingMore.value = false
  products.value.push(...res.products)
  products.notify()
}

async function getProducts(): Promise<ProductAPIResponse> {
  const { skip, limit } = args.value
  const res = await fetch(
    `https://dummyjson.com/products?skip=${skip}&limit=${limit}`
  )
  return res.json()
}

const ProductCard = ({ product }: { product: Product }) => (
  <div key={product.id} className="card">
    <h2>{product.title}</h2>
    <img src={product.images[0]} alt={product.title} />
    <br />
    <div style="padding:1rem">
      <p>{product.description}</p>
      <span>{product.price}</span>
    </div>
  </div>
)

export const LazyListExample = () => {
  const onScroll = () => {
    if (loadingMore.value) return
    const bottomPadding = 50
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    if (scrollTop + clientHeight + bottomPadding >= scrollHeight) {
      args.value.skip += args.value.limit
      args.notify()
    }
  }

  return (
    <Suspense cache promise={getProducts}>
      {(loading: boolean, res: ProductAPIResponse) => {
        if (loading) return <p>loading...</p>
        products.value = res.products
        return (
          <div>
            <div
              className="card-list"
              onMounted={() => document.addEventListener("scroll", onScroll)}
              onUnmounted={() =>
                document.removeEventListener("scroll", onScroll)
              }
            >
              <For each={products}>
                {(p: Product) => <ProductCard product={p} />}
              </For>
            </div>
            <p watch={loadingMore} bind:render={() => loadingMore.value}>
              loading more...
            </p>
          </div>
        )
      }}
    </Suspense>
  )
}
