export type Product = {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  category: string
  thumbnail: string
  images: string[]
}

export type ProductAPIResponse = {
  products: Product[]
  total: number
  skip: 0
  limit: 30
}
