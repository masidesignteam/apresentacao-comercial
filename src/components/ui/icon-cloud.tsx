"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { renderToString } from "react-dom/server"
import { cn } from "@/lib/utils"

interface Icon {
  x: number
  y: number
  z: number
  scale: number
  opacity: number
  id: number
}

interface IconCloudProps {
  icons?: React.ReactNode[]
  images?: string[]
  size?: number
  className?: string
  maxBlur?: number
  autoRotateAxis?: "free" | "x" | "y"
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function drawImageWithDepthBlur({
  ctx,
  image,
  x,
  y,
  drawSize,
  opacity,
  blur,
}: {
  ctx: CanvasRenderingContext2D
  image: HTMLCanvasElement
  x: number
  y: number
  drawSize: number
  opacity: number
  blur: number
}) {
  const halfSize = drawSize / 2

  if (blur <= 0.4) {
    ctx.globalAlpha = opacity
    ctx.drawImage(image, x - halfSize, y - halfSize, drawSize, drawSize)
    return
  }

  const offsets = [
    [0, -1],
    [0.7, -0.7],
    [1, 0],
    [0.7, 0.7],
    [0, 1],
    [-0.7, 0.7],
    [-1, 0],
    [-0.7, -0.7],
    [0.35, -0.35],
    [0.35, 0.35],
    [-0.35, 0.35],
    [-0.35, -0.35],
    [0, -1.45],
    [1.05, -1.05],
    [1.45, 0],
    [1.05, 1.05],
    [0, 1.45],
    [-1.05, 1.05],
    [-1.45, 0],
    [-1.05, -1.05],
  ]

  ctx.globalAlpha = opacity * 0.075

  offsets.forEach(([offsetX, offsetY]) => {
    ctx.drawImage(
      image,
      x - halfSize + offsetX * blur,
      y - halfSize + offsetY * blur,
      drawSize,
      drawSize
    )
  })

  ctx.globalAlpha = opacity * 0.08
  ctx.drawImage(image, x - halfSize, y - halfSize, drawSize, drawSize)
}

export function IconCloud({
  icons,
  images,
  size = 400,
  className,
  maxBlur = 0,
  autoRotateAxis = "free",
}: IconCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const iconBufferSize = Math.max(80, Math.round(size / 4))
  const iconDrawSize = 40
  const iconPositions = useMemo<Icon[]>(() => {
    const items = icons ?? images ?? []
    const numIcons = items.length || 20
    const offset = 2 / numIcons
    const increment = Math.PI * (3 - Math.sqrt(5))
    return Array.from({ length: numIcons }, (_, i) => {
      const y = i * offset - 1 + offset / 2
      const r = Math.sqrt(1 - y * y)
      const phi = i * increment
      return {
        x: Math.cos(phi) * r * 100,
        y: y * 100,
        z: Math.sin(phi) * r * 100,
        scale: 1,
        opacity: 1,
        id: i,
      }
    })
  }, [icons, images])
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [targetRotation, setTargetRotation] = useState<{
    x: number
    y: number
    startX: number
    startY: number
    distance: number
    startTime: number
    duration: number
  } | null>(null)
  const animationFrameRef = useRef<number>(0)
  const rotationRef = useRef({ x: 0, y: 0 })
  const iconCanvasesRef = useRef<HTMLCanvasElement[]>([])
  const imagesLoadedRef = useRef<boolean[]>([])

  // Create icon canvases once when icons/images change
  useEffect(() => {
    if (!icons && !images) return

    const items = icons ?? images ?? []
    imagesLoadedRef.current = new Array(items.length).fill(false)

    const newIconCanvases = items.map((item, index) => {
      const offscreen = document.createElement("canvas")
      offscreen.width = iconBufferSize
      offscreen.height = iconBufferSize
      const offCtx = offscreen.getContext("2d")

      if (offCtx) {
        offCtx.imageSmoothingEnabled = true
        offCtx.imageSmoothingQuality = "high"

        if (images) {
          // Handle image URLs directly
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = items[index] as string
          img.onload = () => {
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height)

            // Contain: fit image within canvas preserving aspect ratio
            const ratio = Math.min(
              offscreen.width / img.naturalWidth,
              offscreen.height / img.naturalHeight
            )
            const drawW = img.naturalWidth * ratio
            const drawH = img.naturalHeight * ratio
            const x = (offscreen.width - drawW) / 2
            const y = (offscreen.height - drawH) / 2
            offCtx.drawImage(img, x, y, drawW, drawH)

            imagesLoadedRef.current[index] = true
          }
        } else {
          // Handle SVG icons
          const svgString = renderToString(item as React.ReactElement)
          const img = new Image()
          img.src = "data:image/svg+xml;base64," + btoa(svgString)
          img.onload = () => {
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height)
            offCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height)
            imagesLoadedRef.current[index] = true
          }
        }
      }
      return offscreen
    })

    iconCanvasesRef.current = newIconCanvases
  }, [icons, images, iconBufferSize])


  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const rect = canvas?.getBoundingClientRect()
    if (!rect || !canvas) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    iconPositions.forEach((icon) => {
      const cosX = Math.cos(rotationRef.current.x)
      const sinX = Math.sin(rotationRef.current.x)
      const cosY = Math.cos(rotationRef.current.y)
      const sinY = Math.sin(rotationRef.current.y)

      const rotatedX = icon.x * cosY - icon.z * sinY
      const rotatedZ = icon.x * sinY + icon.z * cosY
      const rotatedY = icon.y * cosX + rotatedZ * sinX

      const cloudScale = canvas.width / 400
      const screenX = canvas.width / 2 + rotatedX * cloudScale
      const screenY = canvas.height / 2 + rotatedY * cloudScale

      const scale = (rotatedZ + 200) / 300
      const radius = 20 * scale * cloudScale
      const dx = x - screenX
      const dy = y - screenY

      if (dx * dx + dy * dy < radius * radius) {
        const targetX = -Math.atan2(
          icon.y,
          Math.sqrt(icon.x * icon.x + icon.z * icon.z)
        )
        const targetY = Math.atan2(icon.x, icon.z)

        const currentX = rotationRef.current.x
        const currentY = rotationRef.current.y
        const distance = Math.sqrt(
          Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2)
        )

        const duration = Math.min(2000, Math.max(800, distance * 1000))

        setTargetRotation({
          x: targetX,
          y: targetY,
          startX: currentX,
          startY: currentY,
          distance,
          startTime: performance.now(),
          duration,
        })
        return
      }
    })

    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMousePos({ x, y })
    }

    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y

      rotationRef.current = {
        x: rotationRef.current.x + deltaY * 0.002,
        y: rotationRef.current.y + deltaX * 0.002,
      }

      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Animation and rendering
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const cloudScale = canvas.width / 400
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
        const dx = mousePos.x - centerX
        const dy = mousePos.y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const speed = 0.003 + (distance / maxDistance) * 0.01

        if (targetRotation) {
          const elapsed = performance.now() - targetRotation.startTime
          const progress = Math.min(1, elapsed / targetRotation.duration)
          const easedProgress = easeOutCubic(progress)

          rotationRef.current = {
            x:
              targetRotation.startX +
              (targetRotation.x - targetRotation.startX) * easedProgress,
            y:
              targetRotation.startY +
              (targetRotation.y - targetRotation.startY) * easedProgress,
          }

          if (progress >= 1) {
            setTargetRotation(null)
          }
        } else if (!isDragging) {
          const autoRotation =
            autoRotateAxis === "x"
              ? { x: speed, y: 0 }
              : autoRotateAxis === "y"
                ? { x: 0, y: speed }
                : {
                    x: (dy / canvas.height) * speed,
                    y: (dx / canvas.width) * speed,
                  }

          rotationRef.current = {
            x: rotationRef.current.x + autoRotation.x,
            y: rotationRef.current.y + autoRotation.y,
          }
        }

        iconPositions.forEach((icon, index) => {
          const cosX = Math.cos(rotationRef.current.x)
          const sinX = Math.sin(rotationRef.current.x)
          const cosY = Math.cos(rotationRef.current.y)
          const sinY = Math.sin(rotationRef.current.y)

          const rotatedX = icon.x * cosY - icon.z * sinY
          const rotatedZ = icon.x * sinY + icon.z * cosY
          const rotatedY = icon.y * cosX + rotatedZ * sinX

          const scale = (rotatedZ + 200) / 300
          const backDepth = Math.max(0, Math.min(1, 1 - (rotatedZ + 100) / 200))
          const opacity = Math.max(0.12, Math.min(1, (rotatedZ + 150) / 200) * (1 - backDepth * 0.1))
          const screenX = canvas.width / 2 + rotatedX * cloudScale
          const screenY = canvas.height / 2 + rotatedY * cloudScale
          const drawSize = iconDrawSize * scale * cloudScale
          const blur = Math.pow(backDepth, 1.25) * maxBlur

          if (icons || images) {
            // Only try to render icons/images if they exist
            if (
              iconCanvasesRef.current[index] &&
              imagesLoadedRef.current[index]
            ) {
              drawImageWithDepthBlur({
                ctx,
                image: iconCanvasesRef.current[index],
                x: screenX,
                y: screenY,
                drawSize,
                opacity,
                blur,
              })
            }
          } else {
            ctx.save()
            ctx.translate(screenX, screenY)
            ctx.scale(scale * cloudScale, scale * cloudScale)
            ctx.globalAlpha = opacity
            // Show numbered circles if no icons/images are provided
            ctx.beginPath()
            ctx.arc(0, 0, 20, 0, Math.PI * 2)
            ctx.fillStyle = "#4444ff"
            ctx.fill()
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.font = "16px Arial"
            ctx.fillText(`${icon.id + 1}`, 0, 0)
            ctx.restore()
          }
        })
        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animate()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [autoRotateAxis, icons, images, iconPositions, isDragging, maxBlur, mousePos, targetRotation])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={cn("rounded-lg", className)}
      aria-label="Interactive 3D Icon Cloud"
      role="img"
    />
  )
}
