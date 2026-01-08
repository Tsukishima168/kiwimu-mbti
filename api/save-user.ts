
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { uid, email, displayName, method } = req.body;

    if (!uid) {
        return res.status(400).json({ error: 'Missing user ID' });
    }

    try {
        // 1. Load Credentials
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
        const sheetId = process.env.GOOGLE_SHEET_ID;

        if (!serviceAccount.client_email || !serviceAccount.private_key || !sheetId) {
            console.error('Missing credentials or sheet ID');
            return res.status(500).json({ error: 'Server configuration missing' });
        }

        // 2. Initialize Auth
        const serviceAccountAuth = new JWT({
            email: serviceAccount.client_email,
            key: serviceAccount.private_key,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        // 3. Initialize Doc
        const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
        await doc.loadInfo(); // loads document properties and worksheets

        // 4. Get or Create Sheet
        let sheet = doc.sheetsByTitle['Logins'];
        if (!sheet) {
            sheet = await doc.addSheet({ headerValues: ['UID', 'Name', 'Email', 'Method', 'Time', 'Date'] });
        }

        // 5. Append Row
        const now = new Date();
        // Convert to Taiwan Time (UTC+8) roughly for readability or just use ISO
        const timeString = now.toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei' });
        const dateString = now.toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' });

        await sheet.addRow({
            UID: uid,
            Name: displayName || 'Unknown',
            Email: email || 'N/A',
            Method: method || 'unknown',
            Time: timeString,
            Date: dateString
        });

        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('Google Sheet Error:', error);
        return res.status(500).json({ error: 'Failed to save to sheet', details: error.message });
    }
}
