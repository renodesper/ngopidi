import { Badge } from '@/components/atoms/badge'
import { PlaceStatus } from '@prisma/client'

interface PlaceStatusBadgeProps {
    status: PlaceStatus
}

export function PlaceStatusBadge({ status }: PlaceStatusBadgeProps) {
    switch (status) {
        case 'VERIFIED_ADMIN':
            return <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none">VERIFIED ADMIN</Badge>
        case 'VERIFIED_USER':
            return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">VERIFIED USER</Badge>
        case 'PENDING':
            return (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400">
                    PENDING
                </Badge>
            )
        case 'REJECTED':
            return <Badge variant="destructive">REJECTED</Badge>
        default:
            return <Badge variant="secondary">{status.replace(/_/g, ' ')}</Badge>
    }
}
