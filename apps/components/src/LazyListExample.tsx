import * as Cinnabun from "cinnabun"
import "./styles/card-list.css"
import { For } from "cinnabun"
import { Suspense, createSignal } from "cinnabun"
import { ProductAPIResponse, Product } from "./types/products"
import { Carousel } from "./Carousel"
import { sleep } from "cinnabun/utils"

type UrlParams = {
  skip: number
  limit: number
}

const products = createSignal<Product[]>([])
const loadingMore = createSignal<boolean>(false)
const args = createSignal<UrlParams>({ skip: 0, limit: 4 })

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

const serverCacheConfig = {
  maxAge: 5000,
  lastFetch: 0,
}
async function getProducts(): Promise<ProductAPIResponse> {
  if (!Cinnabun.Cinnabun.isClient) {
    const { lastFetch, maxAge } = serverCacheConfig
    const cacheIsFresh = performance.now() - lastFetch < maxAge
    // check if we have cached products and if they are still fresh
    if (products.value.length > 0 && cacheIsFresh) {
      return { products: products.value }
    }
    serverCacheConfig.lastFetch = performance.now()
  }

  const { skip, limit } = args.value
  const res = await fetch(
    `https://dummyjson.com/products?skip=${skip}&limit=${limit}`
  )
  return res.json()
}

const ProductCard = ({ product }: { product: Product }) => (
  <div key={product.id} className="card">
    <h2>{product.title}</h2>
    <Carousel
      images={product.images.map((src) => ({ src, alt: product.title }))}
    />
    <br />
    <div style="padding:1rem">
      <p className="description">{product.description}</p>
      <small>${product.price}</small>
    </div>
  </div>
)

export const LazyListExample = () => {
  const onScroll = () => {
    if (loadingMore.value) return
    const bottomPadding = 500
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    if (scrollTop + clientHeight + bottomPadding >= scrollHeight) {
      args.value.skip += args.value.limit
      args.notify()
    }
  }

  return (
    <>
      <Suspense prefetch cache promise={getProducts}>
        {(loading: boolean, res: ProductAPIResponse) => {
          if (loading) return <p>loading...</p>
          products.value = res.products
          return (
            <>
              <div
                className="card-list"
                onMounted={() => document?.addEventListener("scroll", onScroll)}
                onUnmounted={() =>
                  document?.removeEventListener("scroll", onScroll)
                }
              >
                <For
                  each={products}
                  template={(p) => <ProductCard product={p} />}
                />
              </div>
            </>
          )
        }}
      </Suspense>
      <div
        style="margin: 2rem"
        watch={loadingMore}
        bind:visible={() => loadingMore.value}
      >
        <p>loading more...</p>
      </div>
    </>
  )
}
