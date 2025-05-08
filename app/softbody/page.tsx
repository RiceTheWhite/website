"use client"

import dynamic from 'next/dynamic'
const Rect = dynamic(() => import('@/components/softbody/rect'), { ssr: false })

export default function Page() {
  return (
    <div className="absolute top-0 left-0 -z-[1000]">
      <Rect></Rect>
    </div>
  )
}