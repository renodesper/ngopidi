import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!token || !email) {
        return NextResponse.redirect(
            `${baseUrl}/login?error=missing_parameters&message=${encodeURIComponent('Invalid verification link.')}`
        )
    }

    try {
        // Find the verification token
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token,
            },
        })

        if (!verificationToken) {
            return NextResponse.redirect(
                `${baseUrl}/login?error=invalid_token&message=${encodeURIComponent('Invalid or already used verification link.')}`
            )
        }

        // Check if token has expired
        if (new Date() > verificationToken.expires) {
            // Delete expired token
            await prisma.verificationToken.delete({
                where: {
                    identifier_token: {
                        identifier: email,
                        token,
                    },
                },
            })

            return NextResponse.redirect(
                `${baseUrl}/login?error=expired_token&message=${encodeURIComponent('Verification link has expired. Please register again.')}`
            )
        }

        // Update user's email_verified timestamp
        await prisma.user.update({
            where: { email },
            data: { email_verified: new Date() },
        })

        // Delete the used token
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token,
                },
            },
        })

        return NextResponse.redirect(
            `${baseUrl}/login?verified=true&message=${encodeURIComponent('Email verified successfully! You can now login.')}`
        )
    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.redirect(
            `${baseUrl}/login?error=verification_failed&message=${encodeURIComponent('Something went wrong. Please try again.')}`
        )
    }
}
