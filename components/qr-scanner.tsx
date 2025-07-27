"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: string) => void
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false,
      )

      scannerRef.current.render(
        (decodedText) => {
          onScanSuccess(decodedText)
          setIsScanning(false)
        },
        (error) => {
          onScanError?.(error)
        },
      )
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [onScanSuccess, onScanError])

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="w-full"></div>
    </div>
  )
}
