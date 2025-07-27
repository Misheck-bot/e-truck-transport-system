"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeGeneratorProps {
  data: string
  size?: number
  className?: string
}

export function QRCodeGenerator({ data, size = 200, className }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
    }
  }, [data, size])

  return <canvas ref={canvasRef} className={className} style={{ maxWidth: "100%", height: "auto" }} />
}
