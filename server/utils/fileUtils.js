import fs from 'fs';
import path from 'path';

// Utility function to delete a file
export const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath); // Construct the full path
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath); // Delete the file
      console.log(`File deleted: ${fullPath}`);
    } else {
      console.warn(`File not found: ${fullPath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error.message);
  }
};