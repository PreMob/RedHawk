"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import {InteractiveHoverButton} from "@/components/magicui/interactive-hover-button";
import Link from "next/link";

export function AnimatedHeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const eyeRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize the canvas and start animations when component mounts
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight * 0.9 // 90vh
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Show content with delay for dramatic effect
    setTimeout(() => {
      setIsLoaded(true)
    }, 500)

    // Digital rain effect (matrix-like)
    class DigitalRain {
      drops: { x: number; y: number; speed: number; length: number; char: string }[] = []
      chars = "01"

      constructor(
        private ctx: CanvasRenderingContext2D,
        private width: number,
        private height: number,
      ) {
        this.initDrops()
      }

      initDrops() {
        const dropCount = Math.floor(this.width / 20)
        for (let i = 0; i < dropCount; i++) {
          this.drops.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height * 2 - this.height,
            speed: Math.random() * 2 + 1,
            length: Math.floor(Math.random() * 10) + 5,
            char: this.chars[Math.floor(Math.random() * this.chars.length)],
          })
        }
      }

      update() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
        this.ctx.fillRect(0, 0, this.width, this.height)

        this.ctx.font = "14px monospace"
        this.ctx.fillStyle = "rgba(220, 38, 38, 0.3)" // Red color with low opacity

        for (const drop of this.drops) {
          // Draw the character
          this.ctx.fillText(drop.char, drop.x, drop.y)

          // Update position
          drop.y += drop.speed

          // Reset if it goes off screen
          if (drop.y > this.height) {
            drop.y = -20
            drop.x = Math.random() * this.width
            drop.speed = Math.random() * 2 + 1
            drop.char = this.chars[Math.floor(Math.random() * this.chars.length)]
          }

          // Randomly change character
          if (Math.random() > 0.95) {
            drop.char = this.chars[Math.floor(Math.random() * this.chars.length)]
          }
        }
      }
    }

    // Network nodes effect
    class NetworkNodes {
      nodes: { x: number; y: number; vx: number; vy: number; radius: number }[] = []
      connections: { a: number; b: number; opacity: number }[] = []
      maxConnections = 100
      maxDistance = 200

      constructor(
        private ctx: CanvasRenderingContext2D,
        private width: number,
        private height: number,
      ) {
        this.initNodes()
      }

      initNodes() {
        const nodeCount = Math.min(50, Math.floor((this.width * this.height) / 20000))

        for (let i = 0; i < nodeCount; i++) {
          this.nodes.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
          })
        }
      }

      update() {
        // Update node positions
        for (const node of this.nodes) {
          node.x += node.vx
          node.y += node.vy

          // Bounce off edges
          if (node.x < 0 || node.x > this.width) node.vx *= -1
          if (node.y < 0 || node.y > this.height) node.vy *= -1

          // Draw node
          this.ctx.beginPath()
          this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          this.ctx.fillStyle = "rgba(220, 38, 38, 0.7)"
          this.ctx.fill()
        }

        // Clear old connections
        this.connections = []

        // Find new connections
        for (let i = 0; i < this.nodes.length; i++) {
          for (let j = i + 1; j < this.nodes.length; j++) {
            const dx = this.nodes[i].x - this.nodes[j].x
            const dy = this.nodes[i].y - this.nodes[j].y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < this.maxDistance && this.connections.length < this.maxConnections) {
              this.connections.push({
                a: i,
                b: j,
                opacity: 1 - distance / this.maxDistance,
              })
            }
          }
        }

        // Draw connections
        for (const conn of this.connections) {
          const nodeA = this.nodes[conn.a]
          const nodeB = this.nodes[conn.b]

          this.ctx.beginPath()
          this.ctx.moveTo(nodeA.x, nodeA.y)
          this.ctx.lineTo(nodeB.x, nodeB.y)
          this.ctx.strokeStyle = `rgba(220, 38, 38, ${conn.opacity * 0.3})`
          this.ctx.lineWidth = 1
          this.ctx.stroke()
        }
      }
    }

    // Scanning effect
    class ScanningEffect {
      scanLineY = 0
      scanSpeed = 1
      direction = 1
      lastScanTime = 0
      scanInterval = 5000 // ms between scans

      constructor(
        private ctx: CanvasRenderingContext2D,
        private width: number,
        private height: number,
      ) {}

      update(timestamp: number) {
        // Check if it's time for a new scan
        if (timestamp - this.lastScanTime > this.scanInterval) {
          // Reset scan line to top
          this.scanLineY = 0
          this.lastScanTime = timestamp
          this.direction = 1
        }

        // Only update if we're in an active scan
        if (this.scanLineY >= 0 && this.scanLineY <= this.height) {
          // Draw scan line
          const gradient = this.ctx.createLinearGradient(0, this.scanLineY - 10, 0, this.scanLineY + 10)
          gradient.addColorStop(0, "rgba(220, 38, 38, 0)")
          gradient.addColorStop(0.5, "rgba(220, 38, 38, 0.5)")
          gradient.addColorStop(1, "rgba(220, 38, 38, 0)")

          this.ctx.fillStyle = gradient
          this.ctx.fillRect(0, this.scanLineY - 10, this.width, 20)

          // Draw horizontal line
          this.ctx.beginPath()
          this.ctx.moveTo(0, this.scanLineY)
          this.ctx.lineTo(this.width, this.scanLineY)
          this.ctx.strokeStyle = "rgba(220, 38, 38, 0.8)"
          this.ctx.lineWidth = 2
          this.ctx.stroke()

          // Update position
          this.scanLineY += this.scanSpeed * this.direction * 3
        }
      }
    }

    // Initialize effects
    const digitalRain = new DigitalRain(ctx, canvas.width, canvas.height)
    const networkNodes = new NetworkNodes(ctx, canvas.width, canvas.height)
    const scanningEffect = new ScanningEffect(ctx, canvas.width, canvas.height)

    // Animation loop
    let animationFrameId: number
    let lastTimestamp = 0

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update effects
      digitalRain.update()
      networkNodes.update()
      scanningEffect.update(timestamp)

      lastTimestamp = timestamp
      animationFrameId = requestAnimationFrame(animate)
    }

    animate(0)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  // Hawk eye animation
  useEffect(() => {
    const eyeElement = eyeRef.current
    if (!eyeElement) return

    // Eye movement tracking mouse
    const handleMouseMove = (e: MouseEvent) => {
      const eye = eyeElement.querySelector(".hawk-eye-pupil") as HTMLElement
      if (!eye) return

      const eyeRect = eyeElement.getBoundingClientRect()
      const eyeCenterX = eyeRect.left + eyeRect.width / 2
      const eyeCenterY = eyeRect.top + eyeRect.height / 2

      // Calculate angle between eye center and cursor
      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX)

      // Limit the movement range
      const distance = Math.min(15, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 15)

      // Calculate new position with limited range
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance

      eye.style.transform = `translate(${x}px, ${y}px)`
    }

    // Random blinking
    const blinkInterval = setInterval(
      () => {
        const eyelid = eyeElement.querySelector(".hawk-eye-eyelid") as HTMLElement
        if (!eyelid) return

        eyelid.classList.add("animate-blink")
        setTimeout(() => {
          eyelid.classList.remove("animate-blink")
        }, 300)
      },
      Math.random() * 5000 + 3000,
    )

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(blinkInterval)
    }
  }, [])

  return (
    <section className="relative h-[90vh] flex items-center overflow-hidden">
      {/* Background canvas for animations */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div
            className={`space-y-6 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-red-950/50 border border-red-900/50 text-red-500 text-xs font-medium">
              Advanced Threat Protection
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
              <span className="text-red-500 block mt-2"> RedHawk</span>
              <span className="text-white">by Rejected devs</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md">
              Protecting your digital assets with advanced AI-powered threat detection and real-time monitoring.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/dashboard">
              <InteractiveHoverButton className="border-red-500 text-red-500 hover:bg-red-950 hover:text-white">
                Get Protected
              </InteractiveHoverButton>
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>24/7 Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Threat Intelligence</span>
              </div>
            </div>
          </div>

          {/* Right content - Animated Hawk Eye */}
          <div
            className={`flex justify-center transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Animated Hawk Eye */}
              <div
                ref={eyeRef}
                className="absolute inset-0 bg-gradient-to-br from-red-950 to-black rounded-full border-4 border-red-900/50 overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)]"
              >
                {/* Outer ring with tech pattern */}
                <div className="absolute inset-2 rounded-full border-2 border-red-800/30 animate-[spin_20s_linear_infinite]">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-0.5 bg-red-800/20 top-1/2 left-0 origin-center"
                      style={{ transform: `rotate(${i * 30}deg)` }}
                    ></div>
                  ))}
                </div>

                {/* Middle ring with scanning effect */}
                <div className="absolute inset-8 rounded-full border border-red-700/50 animate-[spin_15s_linear_infinite_reverse]">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-red-700/30 rounded-full"
                      style={{
                        top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                        left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    ></div>
                  ))}
                </div>

                {/* Inner iris */}
                <div className="absolute inset-16 rounded-full bg-gradient-to-br from-amber-700 to-red-900 flex items-center justify-center">
                  {/* Radial lines in iris */}
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-0.5 bg-black/20 origin-center"
                      style={{ transform: `rotate(${i * 18}deg)` }}
                    ></div>
                  ))}

                  {/* Pupil */}
                  <div className="hawk-eye-pupil relative w-1/2 h-1/2 rounded-full bg-black flex items-center justify-center transition-transform duration-200">
                    {/* Pupil highlight */}
                    <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 rounded-full bg-red-500/30"></div>

                    {/* Pupil inner detail */}
                    <div className="w-1/2 h-1/2 rounded-full bg-black border border-red-900/50"></div>
                  </div>
                </div>

                {/* Eyelid animation */}
                <div className="hawk-eye-eyelid absolute inset-0 bg-gradient-to-b from-red-950 to-black rounded-full transform origin-center scale-y-0"></div>

                {/* Tech elements */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  <div className="text-xs text-red-500 font-mono">SCANNING</div>
                </div>

                <div className="absolute bottom-4 right-4 text-xs text-red-500 font-mono">REDHAWK-OS v1.0</div>

                {/* Scanning line */}
                <div className="absolute left-0 right-0 h-0.5 bg-red-500/50 top-1/2 animate-[scanVertical_4s_ease-in-out_infinite]"></div>
              </div>

              {/* Decorative elements around the eye */}
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full border border-red-500/30"></div>
              <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full border border-red-500/20"></div>
              <div className="absolute top-1/4 -right-3 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              <div className="absolute bottom-1/3 -left-2 w-1 h-1 bg-red-500 rounded-full animate-ping"></div>

              {/* Data points */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-full">
                <div className="flex justify-between items-center text-xs text-red-500/70 font-mono">
                  <span>SEC:LEVEL 5</span>
                  <span>THREAT:LOW</span>
                  <span>SYS:ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent"></div>
    </section>
  )
}
