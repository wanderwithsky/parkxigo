import fs from 'fs';
import path from 'path';

// Create uploads directory if it doesn't exist
export function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory:', uploadsDir);
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

export default ensureUploadsDir; 