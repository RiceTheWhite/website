"use client"

import dynamic from 'next/dynamic'
const Fish = dynamic(() => import('@/components/fishes/fish/fish'), { ssr: false })

export default function Page() {
  return (
    <div className="absolute top-0 left-0 -z-[1000]">
      <Fish startPosition={{x: 0, y: (200 + (Math.random() * 600))}}></Fish>
    </div>
  )
}