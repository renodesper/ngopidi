import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
})

interface SendEmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    try {
        await transporter.sendMail({
            from: `"${process.env.SMTP_NAME}" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html,
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to send email:', error)
        return { success: false, error }
    }
}

export async function sendWelcomeEmail(name: string, email: string) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Ngopidi!</h1>
    </div>
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 16px;">Thank you for joining Ngopidi! We're excited to have you as part of our community.</p>
        <p style="font-size: 16px;">With your account, you can now:</p>
        <ul style="font-size: 16px; padding-left: 20px;">
            <li>Discover work-friendly coffee shops near you</li>
            <li>Submit and share your favorite spots</li>
            <li>Help others find the perfect place to work</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login"
               style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Get Started
            </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">If you have any questions, feel free to reach out to us.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            This email was sent to ${email} because you registered for a Ngopidi account.
        </p>
    </div>
</body>
</html>
`

    return sendEmail({
        to: email,
        subject: 'Welcome to Ngopidi!',
        html,
    })
}

export async function sendVerificationEmail(name: string, email: string, token: string) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
    </div>
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 16px;">Thank you for registering with Ngopidi! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Verify Email Address
            </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This verification link will expire in <strong>15 minutes</strong>.</p>
        <p style="font-size: 14px; color: #6b7280;">If you didn't create an account with Ngopidi, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #6366f1; word-break: break-all;">${verificationUrl}</a>
        </p>
    </div>
</body>
</html>
`

    return sendEmail({
        to: email,
        subject: 'Verify your Ngopidi account',
        html,
    })
}
