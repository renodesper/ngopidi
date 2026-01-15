import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/molecules/card'
import { prisma } from '@/lib/prisma'
import { CheckCircle, Clock, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
    const [totalPlaces, pendingPlaces, verifiedPlaces, totalUsers] = await Promise.all([
        prisma.place.count(),
        prisma.place.count({ where: { status: 'PENDING' } }),
        prisma.place.count({ where: { status: 'VERIFIED_ADMIN' } }),
        prisma.user.count(),
    ])

    const stats = [
        {
            title: 'Total Places',
            value: totalPlaces,
            description: 'All registered places',
            icon: MapPin,
            href: '/admin/places',
        },
        {
            title: 'Pending Review',
            value: pendingPlaces,
            description: 'Awaiting verification',
            icon: Clock,
            href: '/admin/places',
        },
        {
            title: 'Verified',
            value: verifiedPlaces,
            description: 'Admin verified places',
            icon: CheckCircle,
            href: '/admin/places',
        },
        {
            title: 'Total Users',
            value: totalUsers,
            description: 'Registered users',
            icon: Users,
            href: '/admin/users',
        },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

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
                        <Link href="/admin/places" className="block p-3 rounded-lg hover:bg-muted transition-colors">
                            <div className="font-medium">Review Pending Places</div>
                            <div className="text-sm text-muted-foreground">
                                {pendingPlaces} places awaiting approval
                            </div>
                        </Link>
                        <Link href="/admin/users" className="block p-3 rounded-lg hover:bg-muted transition-colors">
                            <div className="font-medium">Manage Users</div>
                            <div className="text-sm text-muted-foreground">Add, edit, or remove user accounts</div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
