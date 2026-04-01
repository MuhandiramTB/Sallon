import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
export const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'sallon.db');
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const SALON_NAME = process.env.SALON_NAME || 'Sallon';
export const SALON_LOGO_URL = process.env.SALON_LOGO_URL || '';
export const PRIMARY_COLOR = process.env.PRIMARY_COLOR || '#6366f1';
export const SECONDARY_COLOR = process.env.SECONDARY_COLOR || '#8b5cf6';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
