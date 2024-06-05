import { Suspense, useEffect, useState } from "react"
import "./App.css"
import { useSuspenseQuery } from "@tanstack/react-query"

function App() {
  const [pageLength, setPageLength] = useState(5)
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.95,
    }
    const callback: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio >= 0.8 || entry.isIntersecting) {
          setPageLength((pageLength) => pageLength + 5)
        }
      }
    }

    const observer = new IntersectionObserver(callback, options)

    const lastItem = document.querySelector("#last-item")
    if (!lastItem) {
      console.log("last item not found.")
      return
    }
    observer.observe(lastItem)

    return () => {
      observer.unobserve(lastItem)
    }
  })
  return (
    <div className="grid-container">
      {Array.from({ length: pageLength }, (_, i) => i + 1).map((id) => (
        <div
          key={id}
          className="grid-item"
          id={id === pageLength ? "last-item" : undefined}>
          <Suspense
            key={id}
            fallback={
              <div className="pokedex-skelton" key={id}>
                読み込み中...
              </div>
            }>
            <PokeDex pokeId={id} />
          </Suspense>
        </div>
      ))}
    </div>
  )
}

const usePokeData = (id: number) => {
  return useSuspenseQuery({
    queryKey: [id],
    queryFn: () =>
      fetch(`${import.meta.env["VITE_MY_POKE_API"]}/${id}`).then(
        (res) =>
          res.json() as Promise<{
            name: string
            description: string
            type: string[]
            height_m: number
            weight_kg: number
            genus: string
            image: string
          }>
      ),
  })
}

function PokeDex(props: { pokeId: number }) {
  const { pokeId } = props
  const { data } = usePokeData(pokeId)
  return (
    <div className="pokedex">
      <img src={data.image} />
      <div className="pokedex-info">
        <h2>{data.name}</h2>
        <p>説明: {data.description}</p>
      </div>
    </div>
  )
}

export default App
