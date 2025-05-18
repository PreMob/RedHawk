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
import { useLogAnalysis } from "@/hooks/use-log-analysis"

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
  // Get the analysis data to provide context to the chat
  const { summary, threats } = useLogAnalysis();
  
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
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send message to the backend API
  const sendMessageToApi = async (message: string) => {
    try {
      // Get the latest analysis ID if available
      const logAnalysisId = summary ? summary.logAnalysisId : null;
      
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,  // Include the session ID if we have one
          logAnalysisId  // Include the log analysis ID if available
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error communicating with chat assistant');
      }
      
      const data = await response.json();
      
      // Store the session ID for future messages
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
      
      return data.response;
    } catch (error) {
      console.error('Error sending message to API:', error);
      return "I'm sorry, I encountered an error processing your request. Please try again.";
    }
  };
  
  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sending",
      isEncrypted: true,
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInputValue("")

    // Update status to sent after a delay
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newUserMessage.id ? { ...msg, status: "delivered" } : msg)))
    }, 500)
    
    // Show typing indicator
    setIsTyping(true)
    
    // Get response from API
    try {
      const assistantResponse = await sendMessageToApi(inputValue);
      
      // Create new message from assistant
      const newAgentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        sender: "agent",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEncrypted: true,
        threatLevel: determineThreatLevel(assistantResponse),
      }
      
      // Hide typing indicator and add message
      setIsTyping(false)
      setMessages((prev) => [...prev, newAgentMessage])
    } catch (error) {
      console.error('Error in chat communication:', error);
      
      // Hide typing indicator
      setIsTyping(false)
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        sender: "agent",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEncrypted: true,
        threatLevel: "none",
      }
      
      setMessages((prev) => [...prev, errorMessage])
    }
  }
  
  // Helper function to determine the threat level from the response
  const determineThreatLevel = (response: string): "none" | "low" | "medium" | "high" | "critical" => {
    const lowercaseResponse = response.toLowerCase();
    
    if (lowercaseResponse.includes('critical') || lowercaseResponse.includes('urgent') || 
        lowercaseResponse.includes('immediate action')) {
      return "critical";
    } else if (lowercaseResponse.includes('high risk') || lowercaseResponse.includes('severe')) {
      return "high";
    } else if (lowercaseResponse.includes('medium') || lowercaseResponse.includes('moderate')) {
      return "medium";
    } else if (lowercaseResponse.includes('low risk') || lowercaseResponse.includes('minor')) {
      return "low";
    }
    
    return "none";
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
      // In a real app, you'd upload the file to a server here
      const fileName = files[0].name
      
      // Create a message about the file
      const fileMessage: Message = {
        id: Date.now().toString(),
        content: `Uploaded file: ${fileName}`,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "delivered",
      }
      
      setMessages((prev) => [...prev, fileMessage])
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
      // Show typing indicator
      setIsTyping(true)
      
      // Simulate agent response to file upload after a delay
      setTimeout(() => {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `I've received your file "${fileName}". Would you like me to analyze it for security issues?`,
          sender: "agent",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isEncrypted: true,
        }
        
        setIsTyping(false)
        setMessages((prev) => [...prev, responseMessage])
      }, 1500)
    }
  }

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
                  <div className="text-xs text-center text-gray-500">{message.content}</div>
                ) : (
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 inline-block",
                      message.sender === "user"
                        ? "bg-red-950 text-white rounded-br-none"
                        : "bg-gray-900 text-white rounded-tl-none"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="break-words">{message.content}</div>

                      <div className="flex items-center justify-end gap-2">
                        {message.isEncrypted && (
                          <Shield className="h-3 w-3 text-emerald-500" />
                        )}

                        {message.threatLevel && message.threatLevel !== "none" && (
                          <Badge className={cn(
                            "text-[10px] px-1 py-0 h-4",
                            message.threatLevel === "critical" ? "bg-red-500 text-white" :
                            message.threatLevel === "high" ? "bg-orange-500 text-white" :
                            message.threatLevel === "medium" ? "bg-amber-500 text-black" :
                            "bg-emerald-500 text-white"
                          )}>
                            <AlertTriangle className={cn("h-2 w-2 mr-0.5", message.threatLevel !== "medium" && "text-white")} />
                            {message.threatLevel}
                          </Badge>
                        )}

                        <span className="text-[10px] text-gray-500">{message.timestamp}</span>

                        {message.sender === "user" && message.status && (
                          <span className="text-[10px] text-gray-500">
                            {message.status === "sending" ? "sending..." : message.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {message.sender === "user" && (
                <Avatar className="h-8 w-8 mt-1 border border-red-900/50 flex-shrink-0">
                  <AvatarImage src="/placeholder-user.png" alt="User" />
                  <AvatarFallback className="bg-zinc-800 text-white">
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
        <div className="p-4 border-t border-red-900/30">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-red-900/30 bg-transparent text-gray-400 hover:bg-red-950 hover:text-white"
              onClick={handleFileButtonClick}
            >
              <Paperclip className="h-4 w-4" />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </Button>
            <Input
              className="h-9 bg-transparent border-red-900/30 text-white placeholder-gray-500 focus-visible:ring-red-900/30"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
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
