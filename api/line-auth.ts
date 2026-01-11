import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
function initAdmin() {
    if (admin.apps.length) return;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.error('Missing Firebase Admin env vars');
        return;
    }

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'Method not allowed - use POST' });
    }

    const { code, redirectUri } = req.body;

    if (!code || !redirectUri) {
        return res.status(400).json({
            ok: false,
            error: 'Missing code or redirectUri in request body'
        });
    }

    const clientId = process.env.LINE_CHANNEL_ID;
    const clientSecret = process.env.LINE_CHANNEL_SECRET;

    if (!clientId || !clientSecret) {
        return res.status(500).json({
            ok: false,
            error: 'Server configuration missing - check LINE env vars'
        });
    }

    try {
        // 1. Exchange code for LINE access token
        const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            }).toString(),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('LINE token exchange failed:', tokenData);
            return res.status(400).json({
                ok: false,
                error: 'Failed to exchange code with LINE',
                details: tokenData,
                redirectUriUsed: redirectUri
            });
        }

        // 2. Get LINE user profile
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const profile = await profileResponse.json();

        if (!profileResponse.ok || !profile.userId) {
            return res.status(400).json({
                ok: false,
                error: 'Failed to get LINE profile',
                details: profile
            });
        }

        // 3. Create Firebase custom token
        initAdmin();

        const firebaseUid = `line:${profile.userId}`;
        const customToken = await admin.auth().createCustomToken(firebaseUid, {
            provider: 'line',
            displayName: profile.displayName || '',
            pictureUrl: profile.pictureUrl || '',
        });

        // 4. Return success with Firebase token
        return res.status(200).json({
            ok: true,
            firebaseCustomToken: customToken,
            lineProfile: {
                userId: profile.userId,
                displayName: profile.displayName,
                pictureUrl: profile.pictureUrl,
            },
        });

    } catch (error: any) {
        console.error('LINE auth error:', error);
        return res.status(500).json({
            ok: false,
            error: 'Internal server error',
            details: error.message
        });
    }
}
