
import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    // Check if we are in a production environment where env vars are set properly
    // For local development, you might need to point to a serviceAccountKey.json file
    // or set these environment variables in .env.local

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

    // If parsing failed or empty (no env var), and we are local, you might want to handle it.
    // But usually we expect the user to provide the JSON string in env vars.

    if (Object.keys(serviceAccount).length > 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        console.error("FIREBASE_SERVICE_ACCOUNT environment variable is missing or invalid.");
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.query;

    if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Missing auth code' });
    }

    const clientId = process.env.LINE_CHANNEL_ID;
    const clientSecret = process.env.LINE_CHANNEL_SECRET;
    const redirectUri = process.env.LINE_REDIRECT_URI; // e.g., https://your-site.vercel.app/callback

    if (!clientId || !clientSecret || !redirectUri) {
        return res.status(500).json({ error: 'Server configuration missing' });
    }

    try {
        // 1. Exchange code for access token
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
            console.error('LINE Token Error:', tokenData);
            return res.status(400).json({ error: 'Failed to verify code with LINE', details: tokenData });
        }

        // 2. Get User Profile
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const profileData = await profileResponse.json();
        if (!profileResponse.ok) {
            return res.status(400).json({ error: 'Failed to get LINE profile' });
        }

        const { userId, displayName, pictureUrl } = profileData;

        // 3. Create Firebase Custom Token
        // We use the LINE userId as the Firebase uid
        const firebaseUid = `line:${userId}`;
        const additionalClaims = {
            displayName: displayName,
            photoURL: pictureUrl
        };

        const customToken = await admin.auth().createCustomToken(firebaseUid, additionalClaims);

        // 4. Return token to client
        return res.status(200).json({ customToken });

    } catch (error: any) {
        console.error('Handler Error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
