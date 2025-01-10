/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useEffect, useRef, KeyboardEvent, useLayoutEffect } from 'react'

export default function Fish() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)


  const interpolationParts = 0
  const parts = 10
  const linkSize = 50
  const maxAngle = 40
  const fishBody = new Array(parts).fill(75)
  
  // Set initial fish body positions
  const [fishBodyPosition, setFishBodyPosition] = useState(new Array(parts).fill({x: 100, y:600, dir: 0}))
  
  const requestRef = useRef(0);

  const vel = 2
  const [dir, setDir] = useState(0)

  const lerp = (v0: number, v1: number, t: number) => (v0 + t * (v1-v0))

  useEffect(() => {
    const animate = () => {
      setDir((oldDir) => {
        const d = new Date();
        const time = d.getTime();
        return (Math.sin(time/1000) * 180 + 180)
      })
      
      setFishBodyPosition((oldPointArr) => {
        const newPosition: { x: number; y: number; dir: number, diff: number}[] = []

        for (let index = 0; index < oldPointArr.length; index++) {
          if (index === 0) {
            const radian = dir * Math.PI / 180
            const offsetX = Math.cos(radian) * vel
            const offsetY = Math.sin(radian) * vel
            newPosition.push({ x: oldPointArr[0].x + offsetX, y: oldPointArr[0].y + offsetY, dir: dir-180, diff: 0})
            continue
          }

          const prevSegment = newPosition[index - 1]
          const currSegment = oldPointArr[index]

          const dx = currSegment.x - prevSegment.x
          const dy = currSegment.y - prevSegment.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const angleRad = Math.atan2(dy, dx)
          const angle = angleRad * 180 / Math.PI

          const offsetX = (dx / distance) * linkSize
          const offsetY = (dy / distance) * linkSize

          let positionX = prevSegment.x + offsetX
          let positionY = prevSegment.y + offsetY


          let angleDiff = prevSegment.dir - angle
          angleDiff += (angleDiff>180) ? -360 : (angleDiff<-180) ? 360 : 0

          if (angleDiff > maxAngle) {
            const clampedAngle = prevSegment.dir - maxAngle;
            const rad = (clampedAngle * Math.PI) / 180;
            positionX = prevSegment.x + Math.cos(rad) * linkSize;
            positionY = prevSegment.y + Math.sin(rad) * linkSize;
          } else if (angleDiff < -maxAngle) {
            const clampedAngle = prevSegment.dir + maxAngle;
            const rad = (clampedAngle * Math.PI) / 180;
            positionX = prevSegment.x + Math.cos(rad) * linkSize;
            positionY = prevSegment.y + Math.sin(rad) * linkSize;
          }

          const newSegment = {
            x: positionX,
            y: positionY,
            dir: angle,
            diff: angleDiff,
          }

          newPosition.push(newSegment)
        }
        const canvas = canvasRef.current!
        const context = canvas.getContext('2d')!
        context.reset()
        context.strokeStyle = 'red'

        for (const segment of newPosition) {
          context.lineTo(segment.x, segment.y)
          context.stroke()
        }

        return newPosition
      })
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(requestRef.current)
    }
  }, [dir])
  

  return (
    <div>
      <div>
        {fishBodyPosition.map((item, index) => (
          <div
            key={index}
            style={{
              opacity: 0.2,
              position: "absolute",
              left: `${item.x-fishBody[index]/2}px`,
              top: `${item.y-fishBody[index]/2}px`,
              width: `${fishBody[index]}px`,
              height: `${fishBody[index]}px`,
              backgroundColor: "blue",
              borderRadius: "50%",
              transform: `rotate(${item.dir}deg)`,
            }}
          >
          </div>
        ))}
      </div>
      <canvas width={window.innerWidth} height={window.innerHeight} className='m-0 p-0' ref={canvasRef}></canvas>
    </div>

  )
}
