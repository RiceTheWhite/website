/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useEffect, useRef, KeyboardEvent, useLayoutEffect } from 'react'

export interface Props {
  startPosition: {x: number, y: number}
}

export default function Fish(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const startPosition = props.startPosition

  const interpolationParts = 0
  const parts = 10
  const linkSize = 25
  const maxAngle = 5
  const fishBody = [68, 81, 84, 83, 77, 64, 51, 38, 32, 19]
  
  // Set initial fish body positions
  const [fishBodyPosition, setFishBodyPosition] = useState(new Array(parts).fill({x: startPosition.x, y: startPosition.y, dir: 0}))
  
  const requestRef = useRef(0);

  const vel = 2
  const [dir, setDir] = useState(0)

  const lerp = (v0: number, v1: number, t: number) => (v0 + t * (v1-v0))

  useEffect(() => {
    const animate = () => {
      setDir((oldDir) => {
        const d = new Date();
        const time = d.getTime();
        return (Math.sin(time/2000) * 45)
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

        const deg2rad = (deg:number) => (deg*Math.PI/180)
        const circle_parametric = (x: number, y: number, radius: number, deg: number) => ({
          x: x - radius*Math.cos(deg2rad(deg)),
          y: y - radius*Math.sin(deg2rad(deg))
        })

        let outline: {x: number, y: number}[] = []
        for (let index = 0; index < newPosition.length; index++) {
          const segment = newPosition[index]
          const radius = fishBody[index]/2
          const dir = segment.dir

          const center = {x: segment.x, y: segment.y}
          const front = circle_parametric(center.x, center.y, radius, dir)
          const front_left = circle_parametric(center.x, center.y, radius, dir - 35)
          const front_right = circle_parametric(center.x, center.y, radius, dir + 35)
          const left = circle_parametric(center.x, center.y, radius, dir - 90)
          const right = circle_parametric(center.x, center.y, radius, dir + 90)
          const back = circle_parametric(center.x, center.y, radius, dir + 180)

          if (index === 0) {
            outline.push(front_right)
            outline.push(front)
            outline.push(front_left)
          }

          outline = outline.toSpliced(0, 0, right) // insert at start
          outline.push(left) // insert at end

          if (index === newPosition.length-1) {
            outline.push(back)
          }
        }


        const canvas = canvasRef.current!
        const context = canvas.getContext('2d')!
        context.reset()

        // LINEAR!!!
          // context.beginPath()
          // context.moveTo(outline[0].x, outline[0].y)

          // for (const pos of outline) {
          //   context.lineTo(pos.x, pos.y)
          // }
          // context.lineTo(outline[0].x, outline[0].y)
          // context.stroke()

        context.strokeStyle = 'white'
        context.fillStyle = 'white'

        // QUADRATICS!!!
        context.beginPath()
        context.moveTo(outline[0].x, outline[0].y)
        for (let i = 0; i < outline.length + 1; i++) {
          const current = outline[i % outline.length]
          const next = outline[(i + 1) % outline.length]
          const control = {
            x: (current.x + next.x) / 2,
            y: (current.y + next.y) / 2
          }
          context.quadraticCurveTo(current.x, current.y, control.x, control.y)
        }

        context.closePath()
        context.fill()

        // DEBUG

        // context.strokeStyle = "lime"
        // context.fillStyle = "lime"
        // outline.forEach(point => {
        //   context.beginPath()
        //   context.arc(point.x, point.y, 4, 0, 2 * Math.PI)
        //   context.fill()
        //   context.stroke()
        // });



        // EYESSSSSSSSSSSSSSSSSSS

        const fishHead = newPosition[0]
        const radius = (fishBody[0]/2) - 10

        const eyesPos = [
          circle_parametric(fishHead.x, fishHead.y, radius, fishHead.dir + 70), 
          circle_parametric(fishHead.x, fishHead.y, radius, fishHead.dir - 70)
        ]

        const eyesRadius = 6

        context.strokeStyle = "black"
        context.fillStyle = "black"
        
        for (let index = 0; index < eyesPos.length; index++) {
          const eyePos: {x:number, y:number} = eyesPos[index]

          context.beginPath()
          context.arc(eyePos.x, eyePos.y, eyesRadius, 0, 2 * Math.PI)
          context.fill()
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
      {/* <div>
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
      </div> */}
      <canvas width={window.innerWidth} height={window.innerHeight} className='m-0 p-0' ref={canvasRef}></canvas>
    </div>

  )
}
