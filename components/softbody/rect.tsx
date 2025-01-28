/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { dir } from 'console';
import React, { useState, useEffect, useRef } from 'react'



export default function Rect() {
  const clamp = (x: number, min: number, max: number) => Math.min(Math.max(x, min), max)
  function blendColors(colorA: string, colorB: string, amount: number) {
    const [rA, gA, bA] = colorA.match(/\w\w/g)!.map((c) => parseInt(c, 16));
    const [rB, gB, bB] = colorB.match(/\w\w/g)!.map((c) => parseInt(c, 16));
    const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
    const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
    const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
    return '#' + r + g + b;
  }
  const randomColor = () => "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const requestRef = useRef(0)

  class Point {
    x: number
    y: number
    vx = 0
    vy = 0
    ax = 0
    ay = 0
    mass: number
    color = randomColor()
    constructor(x: number, y: number, mass: number) {
      this.x = x
      this.y = y
      this.mass = mass
    }

    public applyForce(x: number, y: number) {
      this.ax += x / this.mass
      this.ay += y / this.mass
    }

    public update() {
      this.ay += 0.05 // gravity

      this.vx += this.ax
      this.vy += this.ay
      this.x += this.vx
      this.y += this.vy

      this.x = clamp(this.x, 0, window.innerWidth)
      this.y = clamp(this.y, 0, window.innerHeight)
      if (this.x === 0 || this.x === window.innerWidth) {
        this.vx = 0
      }
      if (this.y === 0 || this.y === window.innerHeight) {
        this.vy = 0
      }

      this.ax = 0
      this.ay = 0
    }

    public render() {
      const canvas = canvasRef.current!
      const context = canvas.getContext('2d')!

      context.strokeStyle = this.color
      context.fillStyle = this.color

      context.beginPath()
      context.arc(this.x, this.y, 10, 0, 2 * Math.PI)
      context.fill()
      context.stroke()
    }
  }

  class Spring {
    p1: Point
    p2: Point
    length: number
    stiffness: number
    damping: number

    constructor(p1: Point, p2: Point, length: number, stiffness: number, damping: number) {
      this.p1 = p1
      this.p2 = p2
      this.length = length
      this.stiffness = stiffness
      this.damping = damping
    }

    public render() {
      const canvas = canvasRef.current!
      const context = canvas.getContext('2d')!
      context.strokeStyle = blendColors(this.p1.color, this.p2.color, 0.5)
      context.beginPath()
      context.moveTo(this.p1.x, this.p1.y)
      context.lineTo(this.p2.x, this.p2.y)
      context.stroke()
    }

    public update() {
      const dx = this.p2.x - this.p1.x
      const dy = this.p2.y - this.p1.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      const angle = Math.atan2(dy, dx)
      const force = (distance - this.length) * this.stiffness

      this.p1.applyForce(
        force * Math.cos(angle),
        force * Math.sin(angle)
      )
      this.p2.applyForce(
        -force * Math.cos(angle),
        -force * Math.sin(angle)
      )

      // DAMPING
      const dvx = this.p2.vx - this.p1.vx
      const dvy = this.p2.vy - this.p1.vy 
      const normaldx = dx / distance
      const normaldy = dy / distance
      const dot = dvx * normaldx + dvy * normaldy

      const dampingForceX = dot * normaldx * this.damping
      const dampingForceY = dot * normaldy * this.damping

      this.p1.applyForce(dampingForceX, dampingForceY)
      this.p2.applyForce(-dampingForceX, -dampingForceY)
    }
  }

  class Polygon {
    points: Point[] = []
    springs: Spring[] = []
    index: number
    constructor(index: number, offset: {x: number, y: number}, frame: {x: number, y: number}[], mass: number, stiffness:number, damping:number) {
      this.index = index
      for (let i = 0; i < frame.length; i++) {
        this.points.push(new Point(frame[i].x + offset.x, frame[i].y + offset.y, mass))
      }

      for (let i = 0; i < frame.length; i++) {
        for (let j = i + 1; j < frame.length; j++) {
          const p1 = this.points[i]
          const p2 = this.points[j]
          const length = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
          this.springs.push(new Spring(p1, p2, length, stiffness, damping))
        }
      }
    }

    public update() {
      // COLLISION DETECTION
      const otherShapes = shapes.toSpliced(this.index, 1)

      for (let i = 0; i < this.points.length; i++) {
        const point = this.points[i]
        const py = point.y
        const px = point.x

        for (let i = 0; i < otherShapes.length; i++) {
          const shape = otherShapes[i]
          let collision:boolean = false
          let minDistance: number = Infinity
          let direction: number = 0
          let index1: number = 0
          let index2: number = 0

          for (let c = 0; c < shape.points.length; c++) {
            const vc = shape.points[c]
            const vn = shape.points[(c + 1) % shape.points.length]
            
            const dx = vn.x - vc.x
            const dy = vn.y - vc.y

            const distance2projection = (Math.abs(dy * px - dx * py + vn.x * vc.y - vn.y * vc.x) / Math.sqrt(dy ** 2 + dx ** 2))
            if (distance2projection < minDistance) {
              minDistance = distance2projection
              direction = Math.atan2(dy, dx) + Math.PI / 2
              index1 = c
              index2 = (c + 1) % shape.points.length
            }
            
            if (
              ((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) &&
              (px < (vn.x-vc.x)*(py-vc.y) / (vn.y-vc.y)+vc.x)
            ) {
            collision = !collision;
            }
          }

          // HANDLE COLLISION
          if (!collision) {
            continue
          }
          point.color = 'red'
          const p1 = shape.points[index1]
          const p2 = shape.points[index2]

          const ax = Math.cos(direction) * minDistance
          const ay = Math.sin(direction) * minDistance

          const totalMass = point.mass + p1.mass + p2.mass

          point.vx += -ax * (point.mass / totalMass)
          point.vy += -ay * (point.mass / totalMass)

          p1.vx += ax * (point.mass / totalMass) * Math.cos(direction  + Math.PI / 2)
          p1.vy += ay * (point.mass / totalMass) * Math.sin(direction  + Math.PI / 2)

          p2.vx += ax * (point.mass / totalMass) * (1 - Math.cos(direction  + Math.PI / 2))
          p2.vy += ay * (point.mass / totalMass) * (1 - Math.sin(direction  + Math.PI / 2))
        }
      }



      // SPRINGS PHYSICS
      for (let i = 0; i < this.springs.length; i++) {
        this.springs[i].update()
      }
      for (let i = 0; i < this.points.length; i++) {
        this.points[i].update()
      }

      // RENDER
      for (let i = 0; i < this.springs.length; i++) {
        this.springs[i].render()
      }
      for (let i = 0; i < this.points.length; i++) {
        this.points[i].render()
      }
    }
  }

  const createFrame = (sides: number, radius: number, angle_offset: number = 0) => {
    const frame: {x: number, y: number}[] = []
    for (let i = 0; i < sides; i++) {
      const perimeter = Math.PI * 2
      const angle = (i / sides) * perimeter + angle_offset
      frame.push({x: Math.cos(angle) * radius, y: Math.sin(angle) * radius})
    }
    return frame
  }

  const shapes: Polygon[] = []
  const polygonFrame1 = createFrame(4, 100, 0.25 * Math.PI )
  const polygonFrame2 = createFrame(4, 100)

  shapes.push(new Polygon(0, {x: 500, y: 900} , polygonFrame1, 10, 0.5, 0.9))
  shapes.push(new Polygon(1, {x: 510, y: 500} , polygonFrame2, 10, 0.5, 0.9))


  useEffect(() => {
    const animate = () => {
      // RENDER
      const canvas = canvasRef.current!
      const context = canvas.getContext('2d')!
      context.clearRect(0, 0, canvas.width, canvas.height)

      shapes.forEach(shape => {
        shape.update()
      });

      requestRef.current = requestAnimationFrame(animate)
    }
  

    requestRef.current = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(requestRef.current)
    }
  }, [])
  

  return (
    <div>
      <canvas width={window.innerWidth} height={window.innerHeight} className='m-0 p-0' ref={canvasRef}></canvas>
    </div>
  )
}
