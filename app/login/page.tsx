import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ verified?: string; message?: string; error?: string }>
}) {
    const session = await auth()

    if (session) {
        // @ts-ignore
        const redirectTo = session.user?.role === 'ADMIN' ? '/admin' : '/dashboard'
        redirect(redirectTo)
    }

    const params = await searchParams

    return <LoginForm verified={params.verified} message={params.message} error={params.error} />
}
