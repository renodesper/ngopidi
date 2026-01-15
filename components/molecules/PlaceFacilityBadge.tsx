import { LucideIcon } from 'lucide-react'

interface PlaceFacilityBadgeProps {
    icon: LucideIcon
    label: string
    available: boolean | null
}

export function PlaceFacilityBadge({ icon: Icon, label, available }: PlaceFacilityBadgeProps) {
    return (
        <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${available ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-muted/50 border-border/50 text-muted-foreground opacity-50'}`}
        >
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{label}</span>
        </div>
    )
}
