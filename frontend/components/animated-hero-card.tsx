"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Shield, Lock, AlertTriangle, Wifi } from "lucide-react"

export function AnimatedHeroCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationPhase, setAnimationPhase] = useState(0)

  // Animation sequence controller
  useEffect(() => {
    const phases = [1, 2, 3, 4, 5]
    let currentIndex = 0

    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length
      setAnimationPhase(phases[currentIndex])
    }, 3000)

    return () => clearInterval(intervalId)
  }, [])

  // Canvas animation for network visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Particles for network visualization
    const particles: Particle[] = []
    const particleCount = 50

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 1
        this.speedX = (Math.random() - 0.5) * 1
        this.speedY = (Math.random() - 0.5) * 1
        this.color = `rgba(220, 38, 38, ${Math.random() * 0.5 + 0.2})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        else if (this.x < 0) this.x = canvas.width

        if (this.y > canvas.height) this.y = 0
        else if (this.y < 0) this.y = canvas.height
      }

      draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Connect particles with lines if they're close enough
    function connectParticles() {
      const maxDistance = 100
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(220, 38, 38, ${1 - distance / maxDistance})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    // Animation loop
    let animationFrameId: number

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (const particle of particles) {
        particle.update()
        particle.draw()
      }

      connectParticles()

      // Draw scanning effect based on animation phase
      if (animationPhase === 2 || animationPhase === 4) {
        const scanLineY = ((Date.now() % 3000) / 3000) * canvas.height
        ctx.beginPath()
        ctx.strokeStyle = "rgba(220, 38, 38, 0.5)"
        ctx.lineWidth = 2
        ctx.moveTo(0, scanLineY)
        ctx.lineTo(canvas.width, scanLineY)
        ctx.stroke()

        // Add glow effect to scan line
        const gradient = ctx.createLinearGradient(0, scanLineY - 10, 0, scanLineY + 10)
        gradient.addColorStop(0, "rgba(220, 38, 38, 0)")
        gradient.addColorStop(0.5, "rgba(220, 38, 38, 0.3)")
        gradient.addColorStop(1, "rgba(220, 38, 38, 0)")

        ctx.fillStyle = gradient
        ctx.fillRect(0, scanLineY - 10, canvas.width, 20)
      }

      // Draw radar effect for phase 3
      if (animationPhase === 3) {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const maxRadius = Math.min(canvas.width, canvas.height) * 0.4

        // Draw radar circles
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath()
          ctx.strokeStyle = "rgba(220, 38, 38, 0.3)"
          ctx.lineWidth = 1
          ctx.arc(centerX, centerY, maxRadius * (i / 3), 0, Math.PI * 2)
          ctx.stroke()
        }

        // Draw rotating radar line
        const angle = (Date.now() / 1000) % (Math.PI * 2)
        ctx.beginPath()
        ctx.strokeStyle = "rgba(220, 38, 38, 0.7)"
        ctx.lineWidth = 2
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius)
        ctx.stroke()

        // Add glow to the end of the line
        ctx.beginPath()
        ctx.fillStyle = "rgba(220, 38, 38, 0.5)"
        ctx.arc(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius, 5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw binary data for phase 5
      if (animationPhase === 5) {
        ctx.font = "10px monospace"
        ctx.fillStyle = "rgba(220, 38, 38, 0.7)"

        const rows = Math.floor(canvas.height / 15)
        const cols = Math.floor(canvas.width / 10)

        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            // Only draw some of the binary digits (random pattern)
            if (Math.random() > 0.85) {
              const digit = Math.round(Math.random())
              ctx.fillText(digit.toString(), j * 10, i * 15)
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [animationPhase])

  return (
    <Card className="w-full max-w-md aspect-square bg-black border-red-900/50 relative overflow-hidden">
      {/* Background canvas for animations */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent pointer-events-none"></div>

      {/* Content that changes based on animation phase */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        {animationPhase === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <Shield className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-red-500">Threat Detection</h3>
            <p className="text-sm text-gray-400">
              Advanced AI algorithms identify and neutralize threats before they can cause damage
            </p>
            <div className="w-16 h-1 bg-red-500/50 mx-auto"></div>
          </div>
        )}

        {animationPhase === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <Lock className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-red-500">Secure Access</h3>
            <p className="text-sm text-gray-400">
              Multi-factor authentication and zero-trust architecture protect your sensitive data
            </p>
            <div className="w-16 h-1 bg-red-500/50 mx-auto"></div>
          </div>
        )}

        {animationPhase === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <Wifi className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-red-500">Network Security</h3>
            <p className="text-sm text-gray-400">
              Real-time monitoring and protection for your entire network infrastructure
            </p>
            <div className="w-16 h-1 bg-red-500/50 mx-auto"></div>
          </div>
        )}

        {animationPhase === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-red-500">Incident Response</h3>
            <p className="text-sm text-gray-400">Rapid response protocols to contain and mitigate security breaches</p>
            <div className="w-16 h-1 bg-red-500/50 mx-auto"></div>
          </div>
        )}

        {animationPhase === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="relative h-16 w-16 mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-950 animate-pulse"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-bold text-red-500">R</div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-red-500">RedHawk Security</h3>
            <p className="text-sm text-gray-400">Complete cybersecurity solutions for modern enterprises</p>
            <div className="w-16 h-1 bg-red-500/50 mx-auto"></div>
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
        <div className="text-xs text-red-500 font-mono">SCANNING</div>
      </div>

      <div className="absolute bottom-4 right-4 text-xs text-red-500 font-mono">
        {new Date().toISOString().split("T")[0]}
      </div>

      {/* Tech grid lines */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-l border-red-900/20 h-full"></div>
        ))}
      </div>
      <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-t border-red-900/20 w-full"></div>
        ))}
      </div>
    </Card>
  )
}
