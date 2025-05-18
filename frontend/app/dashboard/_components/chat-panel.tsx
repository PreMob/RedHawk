"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Shield, AlertTriangle, X, MoreVertical, Maximize2, Minimize2, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "agent" | "system"
  timestamp: string
  status?: "sending" | "sent" | "delivered" | "read" | "error"
  isEncrypted?: boolean
  threatLevel?: "none" | "low" | "medium" | "high" | "critical"
}

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function ChatPanel({ isOpen, onClose, className }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Chat session started",
      sender: "system",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      content: "Hello, I'm your RedHawk security assistant. How can I help you today?",
      sender: "agent",
      timestamp: "10:30 AM",
      isEncrypted: true,
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate agent typing
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === "user") {
      setIsTyping(true)
      const timer = setTimeout(() => {
        setIsTyping(false)
        simulateAgentResponse()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sending",
      isEncrypted: true,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Update status to sent after a delay
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)
  }

  const simulateAgentResponse = () => {
    const responses = [
      "I've analyzed your network logs and found several suspicious activities. Would you like me to generate a detailed report?",
      "The threat has been identified and quarantined. Our system has blocked the malicious IP address.",
      "I've detected unusual login attempts from IP 192.168.1.105. This might indicate a potential brute force attack.",
      "The security scan is complete. No critical vulnerabilities were found, but there are 3 medium-risk issues that should be addressed.",
      "I've updated the firewall rules based on the latest threat intelligence. Your network is now protected against the recent ransomware variant.",
    ]

    const threatLevels: ("none" | "low" | "medium" | "high" | "critical")[] = [
      "none",
      "low",
      "medium",
      "high",
      "critical",
    ]

    const newMessage: Message = {
      id: Date.now().toString(),
      content: responses[Math.floor(Math.random() * responses.length)],
      sender: "agent",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isEncrypted: true,
      threatLevel: threatLevels[Math.floor(Math.random() * threatLevels.length)],
    }

    setMessages((prev) => [...prev, newMessage])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // In a real app, you would handle file upload here
      const fileName = files[0].name
      const newMessage: Message = {
        id: Date.now().toString(),
        content: `Uploaded file: ${fileName}`,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sending",
        isEncrypted: true,
      }

      setMessages((prev) => [...prev, newMessage])

      // Update status to sent after a delay
      setTimeout(() => {
        setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg)))
      }, 1000)
    }
  }

  const getThreatLevelIcon = (level?: "none" | "low" | "medium" | "high" | "critical") => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Shield className="h-4 w-4 text-green-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getThreatLevelBadge = (level?: "none" | "low" | "medium" | "high" | "critical") => {
    switch (level) {
      case "critical":
        return (
          <Badge variant="outline" className="border-red-500 bg-red-950/30 text-red-500">
            Critical Threat
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="border-amber-500 bg-amber-950/30 text-amber-500">
            High Threat
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="border-yellow-500 bg-yellow-950/30 text-yellow-500">
            Medium Threat
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="border-green-500 bg-green-950/30 text-green-500">
            Low Threat
          </Badge>
        )
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <Card
      className={cn(
        "border-red-900/30 bg-black flex flex-col fixed bottom-0 right-4 z-50 shadow-lg transition-all duration-200",
        isExpanded ? "w-[600px] h-[600px]" : "w-[350px] h-[450px]",
        className,
      )}
    >
      <CardHeader className="px-4 py-3 border-b border-red-900/30 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-red-900/50">
            <AvatarImage src="/logo.png" alt="RedHawk Agent" />
            <AvatarFallback className="bg-red-950 text-red-500">RA</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-semibold text-white">RedHawk Assistant</CardTitle>
            <p className="text-xs text-gray-400">Secure Channel</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:bg-red-950 hover:text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:bg-red-950 hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.sender === "user" ? "justify-end" : "justify-start",
                message.sender === "system" && "justify-center"
              )}
            >
              {message.sender === "agent" && (
                <Avatar className="h-8 w-8 mt-1 border border-red-900/50 flex-shrink-0">
                  <AvatarImage src="/logo.png" alt="RedHawk Agent" />
                  <AvatarFallback className="bg-red-950 text-red-500">RA</AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                "max-w-[75%] overflow-hidden",
                message.sender === "system" && "max-w-full w-full"
              )}>
                {message.sender === "system" ? (
                  <div className="flex items-center justify-center">
                    <div className="px-3 py-1 rounded-full bg-red-950/20 border border-red-900/30 text-xs text-gray-400">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 block w-full overflow-hidden",
                        message.sender === "user"
                          ? "bg-red-950/30 text-white rounded-tr-none"
                          : "bg-gray-900 text-white rounded-tl-none",
                        message.threatLevel && message.threatLevel !== "none" && "border-l-2",
                        message.threatLevel === "critical" && "border-l-red-500",
                        message.threatLevel === "high" && "border-l-amber-500",
                        message.threatLevel === "medium" && "border-l-yellow-500",
                        message.threatLevel === "low" && "border-l-green-500"
                      )}
                    >
                      {message.threatLevel && message.threatLevel !== "none" && (
                        <div className="flex items-center gap-1 mb-1">
                          {getThreatLevelIcon(message.threatLevel)}
                          {getThreatLevelBadge(message.threatLevel)}
                        </div>
                      )}
                      <p className="text-sm break-words whitespace-normal overflow-wrap-anywhere">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {message.isEncrypted && <Shield className="h-3 w-3 text-gray-500" />}
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                        {message.sender === "user" && message.status && (
                          <span className="text-xs text-gray-500">
                            {message.status === "sending" && "•"}
                            {message.status === "sent" && "✓"}
                            {message.status === "delivered" && "✓✓"}
                            {message.status === "read" && "✓✓"}
                            {message.status === "error" && "!"}
                          </span>
                        )}
                      </div>
                    </div>
                    {message.sender === "agent" && (
                      <div className="flex items-center gap-1 mt-1 ml-1">
                        <span className="text-xs text-gray-500">RedHawk Agent</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              {message.sender === "user" && (
                <Avatar className="h-8 w-8 mt-1 border border-red-900/50">
                  <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
                  <AvatarFallback className="bg-gray-800 text-gray-300">
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <Avatar className="h-8 w-8 mt-1 border border-red-900/50">
                <AvatarImage src="/logo.png" alt="RedHawk Agent" />
                <AvatarFallback className="bg-red-950 text-red-500">RA</AvatarFallback>
              </Avatar>
              <div className="bg-gray-900 rounded-lg px-4 py-2 rounded-tl-none inline-block">
                <div className="flex space-x-1">
                  <div
                    className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "200ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "400ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 border-t border-red-900/30">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-red-900/30 bg-black text-gray-400 hover:bg-red-950 hover:text-white"
              onClick={handleFileButtonClick}
            >
              <Paperclip className="h-4 w-4" />
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </Button>
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 bg-black border-red-900/30 focus-visible:ring-red-500 text-white"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-red-900/30 bg-black text-gray-400 hover:bg-red-950 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black border-red-900/30">
                <DropdownMenuItem className="text-gray-400 focus:bg-red-950 focus:text-white">
                  Request Security Scan
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-400 focus:bg-red-950 focus:text-white">
                  Upload Log Files
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-400 focus:bg-red-950 focus:text-white">
                  Clear Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className="h-9 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleSendMessage}
              disabled={inputValue.trim() === ""}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
