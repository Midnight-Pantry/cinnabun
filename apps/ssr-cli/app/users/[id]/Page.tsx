export default function Page({ params }: { params: { id?: string } }) {
  return <h1>User {params.id}</h1>
}
