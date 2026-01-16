'use client'

import { authenticate } from '@/app/actions/auth'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/molecules/card'
import Link from 'next/link'
import { useActionState } from 'react'

interface LoginFormProps {
    verified?: string
    message?: string
    error?: string
}

export function LoginForm({ verified, message, error }: LoginFormProps) {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                    {verified && message && (
                        <div className="mt-2 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm rounded-md">
                            {message}
                        </div>
                    )}
                    {error && message && (
                        <div className="mt-2 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm rounded-md">
                            {message}
                        </div>
                    )}
                </CardHeader>
                <form action={dispatch}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" placeholder="password" required />
                        </div>
                        {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 mt-4">
                        <Button className="w-full cursor-pointer" type="submit" disabled={isPending}>
                            {isPending ? 'Logging in...' : 'Login'}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-primary hover:underline">
                                Register
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
