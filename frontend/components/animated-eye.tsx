"use client"

import { useEffect, useRef, useState } from "react"

export function AnimatedEye() {
  const eyeRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isBlinking, setIsBlinking] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scanMode, setScanMode] = useState<"mouse" | "auto">("mouse")
  const [scanDirection, setScanDirection] = useState(0)
  const [statusText, setStatusText] = useState("IDLE")

  // Handle mouse movement to track cursor when in mouse mode
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current || scanMode !== "mouse") return

      const rect = eyeRef.current.getBoundingClientRect()
      const eyeCenterX = rect.left + rect.width / 2
      const eyeCenterY = rect.top + rect.height / 2

      // Calculate angle between eye center and cursor
      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX)

      // Limit the movement range
      const distance = Math.min(10, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 20)

      // Calculate new position with limited range
      const x = 50 + Math.cos(angle) * distance
      const y = 50 + Math.sin(angle) * distance

      setPosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [scanMode])

  // Automatic scanning in different directions
  useEffect(() => {
    // Switch between mouse tracking and automatic scanning
    const modeInterval = setInterval(() => {
      setScanMode((prev) => (prev === "mouse" ? "auto" : "mouse"))

      if (scanMode === "mouse") {
        setStatusText("AUTO SCAN")
      } else {
        setStatusText("TRACKING")
      }
    }, 8000)

    return () => clearInterval(modeInterval)
  }, [scanMode])

  // Handle automatic scanning when in auto mode
  useEffect(() => {
    if (scanMode !== "auto") return

    // Define scan positions (8 directions + center)
    const scanPositions = [
      { x: 50, y: 40 }, // Top
      { x: 60, y: 40 }, // Top-right
      { x: 60, y: 50 }, // Right
      { x: 60, y: 60 }, // Bottom-right
      { x: 50, y: 60 }, // Bottom
      { x: 40, y: 60 }, // Bottom-left
      { x: 40, y: 50 }, // Left
      { x: 40, y: 40 }, // Top-left
      { x: 50, y: 50 }, // Center
    ]

    let currentIndex = 0

    // Change direction every 1 second
    const directionInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % scanPositions.length
      setScanDirection(currentIndex)

      // Smoothly animate to the new position
      const newPosition = scanPositions[currentIndex]
      setPosition((prev) => ({
        x: prev.x + (newPosition.x - prev.x) * 0.2,
        y: prev.y + (newPosition.y - prev.y) * 0.2,
      }))

      // Occasionally trigger analysis mode
      if (currentIndex === 8) {
        // When centered
        setIsAnalyzing(true)
        setStatusText("ANALYZING LOGS")
        setTimeout(() => {
          setIsAnalyzing(false)
          setStatusText("AUTO SCAN")
        }, 2000)
      }
    }, 1000)

    // Smoother animation using requestAnimationFrame
    let animationFrameId: number

    const animate = () => {
      if (scanMode === "auto") {
        const targetPosition = scanPositions[scanDirection]
        setPosition((prev) => ({
          x: prev.x + (targetPosition.x - prev.x) * 0.1,
          y: prev.y + (targetPosition.y - prev.y) * 0.1,
        }))
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      clearInterval(directionInterval)
      cancelAnimationFrame(animationFrameId)
    }
  }, [scanMode, scanDirection])

  // Random blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        setIsBlinking(true)
        setTimeout(() => setIsBlinking(false), 150)
      },
      Math.random() * 3000 + 2000,
    )

    return () => clearInterval(blinkInterval)
  }, [])

  // Scanning effect
  useEffect(() => {
    const scanInterval = setInterval(
      () => {
        setIsScanning(true)
        setStatusText("THREAT DETECTION")
        setTimeout(() => {
          setIsScanning(false)
          setStatusText(scanMode === "mouse" ? "TRACKING" : "AUTO SCAN")
        }, 2000)
      },
      Math.random() * 8000 + 5000,
    )

    return () => clearInterval(scanInterval)
  }, [scanMode])

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      {/* Eye outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-red-600/70 animate-pulse"></div>

      {/* Eye middle ring */}
      <div className="absolute inset-8 rounded-full border-2 border-red-500/50 animate-[pulse_2s_ease-in-out_infinite]"></div>

      {/* Eye inner circle */}
      <div
        ref={eyeRef}
        className={`absolute inset-16 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center
          ${isScanning ? "animate-[pulse_0.5s_ease-in-out_infinite]" : ""}
          ${isAnalyzing ? "bg-gradient-to-br from-amber-700 to-red-900" : ""}`}
      >
        {/* Pupil */}
        <div
          className={`w-1/2 h-1/2 rounded-full relative transition-all duration-200
            ${isBlinking ? "scale-y-[0.1]" : "scale-100"}
            ${isScanning ? "bg-red-400" : isAnalyzing ? "bg-amber-500" : "bg-red-500"}`}
          style={{
            boxShadow: `0 0 20px ${isScanning ? "#ff0000" : isAnalyzing ? "#f59e0b" : "rgba(220, 38, 38, 0.7)"}`,
            left: `calc(${position.x}% - 25%)`,
            top: `calc(${position.y}% - 25%)`,
            transition: scanMode === "auto" ? "left 0.5s ease-out, top 0.5s ease-out" : "left 0.1s, top 0.1s",
          }}
        >
          {/* Pupil highlight */}
          <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 rounded-full bg-white/30"></div>

          {/* Analysis pattern - only visible during analysis */}
          {isAnalyzing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1/2 h-1/2 border-2 border-amber-300/50 rounded-full animate-[spin_2s_linear_infinite]"></div>
              <div className="absolute w-full h-0.5 bg-amber-300/30"></div>
              <div className="absolute w-0.5 h-full bg-amber-300/30"></div>
            </div>
          )}
        </div>
      </div>

      {/* Scanning lines */}
      {isScanning && (
        <>
          <div className="absolute inset-0 border-t-2 border-red-500/70 animate-[scan_2s_linear_infinite]"></div>
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-red-500/30"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-500/30"></div>
        </>
      )}

      {/* Analysis visualization */}
      {isAnalyzing && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-amber-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-4 border border-amber-500/20 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>
          {/* Binary data visualization */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-[8px] font-mono text-amber-500/70"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {Math.random() > 0.5 ? "01" : "10"}
            </div>
          ))}
        </div>
      )}

      {/* Tech circles */}
      <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full border border-red-500/50"></div>
      <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full border border-red-500/30"></div>

      {/* Data points */}
      <div className="absolute top-1/4 -right-3 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
      <div className="absolute bottom-1/3 -left-2 w-1 h-1 bg-red-500 rounded-full animate-ping"></div>

      {/* Status indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${isScanning || isAnalyzing ? "bg-amber-500 animate-ping" : "bg-red-500 animate-pulse"}`}
        ></div>
        <div className="text-xs text-red-500 font-mono">{statusText}</div>
      </div>

      {/* RedHawk context */}
      <div className="absolute bottom-4 right-4 text-xs text-red-500 font-mono">PENTEST-AI</div>

      {/* Log analysis indicator - only visible during analysis */}
      {isAnalyzing && (
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <div className="text-xs text-amber-500/70 font-mono animate-pulse">ANALYZING NETWORK LOGS</div>
        </div>
      )}
    </div>
  )
}
