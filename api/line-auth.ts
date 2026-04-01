import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

// ── Supabase Admin（LINE user session 建立）────────────────────────────────────
function getSupabaseAdmin() {
    const url = process.env.VITE_MOON_ISLAND_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return null;
    return createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

function normalizeOrigin(origin: string): string {
    return origin.trim().replace(/\/+$/, '').toLowerCase();
}

function getHeaderValue(value: string | string[] | undefined): string | undefined {
    if (!value) return undefined;
    if (Array.isArray(value)) return value[0];
    return value;
}

function getAllowedOrigins(req: VercelRequest): string[] {
    const configured = (process.env.LINE_AUTH_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((origin) => normalizeOrigin(origin))
        .filter(Boolean);

    const defaults = [
        'https://kiwimu.com',
        'https://www.kiwimu.com',
        'https://mbti.kiwimu.com',
        'http://localhost:3000',
        'http://localhost:5173',
    ];

    const host = getHeaderValue(req.headers.host);
    if (host) {
        const protocol = host.includes('localhost') ? 'http' : 'https';
        defaults.push(`${protocol}://${host}`);
    }

    return Array.from(new Set([...defaults, ...configured]));
}

function resolveRequestOrigin(req: VercelRequest): string | undefined {
    const origin = getHeaderValue(req.headers.origin);
    if (origin) return normalizeOrigin(origin);

    const referer = getHeaderValue(req.headers.referer);
    if (!referer) return undefined;
    try {
        return normalizeOrigin(new URL(referer).origin);
    } catch {
        return undefined;
    }
}

function validateRedirectUri(redirectUri: string, allowedOrigins: string[]): boolean {
    try {
        const redirectOrigin = normalizeOrigin(new URL(redirectUri).origin);
        return allowedOrigins.includes(redirectOrigin);
    } catch {
        return false;
    }
}

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
    const allowedOrigins = getAllowedOrigins(req);
    const requestOrigin = resolveRequestOrigin(req);
    const expectedToken = process.env.INTERNAL_API_TOKEN;
    const providedToken = getHeaderValue(req.headers['x-internal-token']);
    const hasInternalToken = !!expectedToken && providedToken === expectedToken;
    const isOriginAllowed = !!requestOrigin && allowedOrigins.includes(requestOrigin);

    if (isOriginAllowed && requestOrigin) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    }
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Internal-Token');

    if (req.method === 'OPTIONS') {
        if (!isOriginAllowed && !hasInternalToken) {
            return res.status(403).json({ ok: false, error: 'Origin not allowed' });
        }
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'Method not allowed - use POST' });
    }

    if (!isOriginAllowed && !hasInternalToken) {
        return res.status(403).json({ ok: false, error: 'Origin not allowed' });
    }

    const { code, redirectUri } = req.body;

    if (!code || !redirectUri) {
        return res.status(400).json({
            ok: false,
            error: 'Missing code or redirectUri in request body'
        });
    }

    if (!validateRedirectUri(redirectUri, allowedOrigins)) {
        return res.status(400).json({
            ok: false,
            error: 'Invalid redirectUri origin'
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

        // 4. Create Supabase session for LINE user（for cross-subdomain SSO）
        let supabaseHashedToken: string | undefined;
        try {
            const supabaseAdmin = getSupabaseAdmin();
            if (supabaseAdmin) {
                const syntheticEmail = `line_${profile.userId}@line.kiwimu.com`;

                // Upsert user（createUser 若已存在會報錯，改用 admin.getUserByEmail → createUser）
                const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(syntheticEmail);
                if (!existingUser.user) {
                    await supabaseAdmin.auth.admin.createUser({
                        email: syntheticEmail,
                        user_metadata: {
                            provider: 'line',
                            line_user_id: profile.userId,
                            display_name: profile.displayName || '',
                            picture_url: profile.pictureUrl || '',
                        },
                        email_confirm: true,
                    });
                }

                // Generate magic link token for client to exchange for session
                const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
                    type: 'magiclink',
                    email: syntheticEmail,
                });
                supabaseHashedToken = linkData?.properties?.hashed_token;
            }
        } catch (supabaseErr: unknown) {
            // 非阻塞：Supabase 失敗不影響 Firebase 登入主流程
            console.error('⚠️ Supabase LINE session creation failed (non-blocking):', supabaseErr);
        }

        // 5. Return success with Firebase token (+ optional Supabase token)
        return res.status(200).json({
            ok: true,
            firebaseCustomToken: customToken,
            lineProfile: {
                userId: profile.userId,
                displayName: profile.displayName,
                pictureUrl: profile.pictureUrl,
            },
            ...(supabaseHashedToken && { supabaseHashedToken }),
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
