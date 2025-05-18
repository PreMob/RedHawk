import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
    title: string
    value: string
    className?: string
}

export function StatsCard({ title, value, className }: StatsCardProps) {
    return (
        <Card className="border-red-900/30 bg-black">
            <CardContent className="p-6">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
