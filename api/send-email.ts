import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'MBTI Lab <onboarding@resend.dev>';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { to, subject, text, html } = req.body as {
        to?: string;
        subject?: string;
        text?: string;
        html?: string;
    };

    if (!to || typeof to !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "to" email' });
    }
    if (!subject || typeof subject !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "subject"' });
    }
    if (!text && !html) {
        return res.status(400).json({ error: 'Provide at least one of "text" or "html"' });
    }

    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not set');
        return res.status(500).json({ error: 'Email service not configured' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM,
            to: [to],
            subject,
            text: text || undefined,
            html: html || undefined,
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ ok: true, id: data?.id });
    } catch (err) {
        console.error('Send email error:', err);
        return res.status(500).json({
            error: err instanceof Error ? err.message : 'Failed to send email',
        });
    }
}
