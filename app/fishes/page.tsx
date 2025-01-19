/* eslint-disable @typescript-eslint/no-unused-vars */
import Fish from "@/components/fishes/fish/fish"

export default async function Page() {
  return (
    <div className="absolute top-0 left-0 -z-[1000]">
      <Fish startPosition={{x: 0, y: (Math.random() * window.innerWidth)}}></Fish>
    </div>
  )
}