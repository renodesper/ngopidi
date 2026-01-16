import { auth } from '@/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/molecules/card'
import { prisma } from '@/lib/prisma'
import { CheckCircle, Clock, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const [totalPlaces, pendingPlaces, verifiedPlaces] = await Promise.all([
        prisma.place.count(),
        prisma.place.count({ where: { status: 'PENDING' } }),
        prisma.place.count({ where: { OR: [{ status: 'VERIFIED_USER' }, { status: 'VERIFIED_ADMIN' }] } }),
    ])

    const stats = [
        {
            title: 'Total Places',
            value: totalPlaces,
            description: 'All registered places',
            icon: MapPin,
            href: '/dashboard/places',
        },
        {
            title: 'Pending Review',
            value: pendingPlaces,
            description: 'Awaiting verification',
            icon: Clock,
            href: '/dashboard/places',
        },
        {
            title: 'Verified',
            value: verifiedPlaces,
            description: 'Admin verified places',
            icon: CheckCircle,
            href: '/dashboard/places',
        },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Link key={stat.title} href={stat.href}>
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link
                            href="/dashboard/places"
                            className="block p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                            <div className="font-medium">Review Pending Places</div>
                            <div className="text-sm text-muted-foreground">
                                {pendingPlaces} places awaiting approval
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
