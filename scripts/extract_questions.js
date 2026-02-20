import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const constantsFile = fs.readFileSync(path.join(__dirname, '../constants.ts'), 'utf-8');

// A very naive extraction to get id, text, and options.
const qMatch = constantsFile.match(/export const QUESTIONS: Question\[\] = \[([\s\S]*?)\];/);
if (qMatch) {
    fs.writeFileSync(path.join(__dirname, '../extracted_questions.txt'), qMatch[1]);
}
