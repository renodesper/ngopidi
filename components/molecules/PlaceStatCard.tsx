import { LucideIcon } from 'lucide-react'

interface PlaceStatCardProps {
    icon: LucideIcon
    label: string
    value: string | number
    subValue?: string | null
    onClick?: () => void
}

export function PlaceStatCard({ icon: Icon, label, value, subValue, onClick }: PlaceStatCardProps) {
    return (
        <div
            className={`glass-card p-4 flex flex-col gap-2 ${onClick ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex flex-col">
                <span
                    className={`text-lg font-bold ${onClick ? 'text-primary underline decoration-dotted underline-offset-4' : ''}`}
                >
                    {value}
                </span>
                {subValue && <span className="text-[10px] text-muted-foreground">{subValue}</span>}
            </div>
        </div>
    )
}
