"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ChatButtonProps {
    onClick: () => void
    unreadCount?: number
}

export function ChatButton({ onClick, unreadCount = 0 }: ChatButtonProps) {
    return (
        <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-red-900/30 bg-black text-red-500 hover:bg-red-950 hover:text-white fixed bottom-4 right-4 z-50 shadow-lg"
            onClick={onClick}
        >
            <MessageSquare className="h-5 w-5" />
            {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white">
                    {unreadCount}
                </Badge>
            )}
        </Button>
    )
}
