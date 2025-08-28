// lib/uploadthing.ts
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function deleteUploadthingFile(url: string): Promise<boolean> {
  try {
    const fileKey = extractFileKeyFromUrl(url);
    
    if (!fileKey) {
      console.error("Could not extract file key from URL:", url);
      return false;
    }

    await utapi.deleteFiles(fileKey);
    console.log("Successfully deleted file from Uploadthing:", fileKey);
    return true;
  } catch (error) {
    console.error("Error deleting file from Uploadthing:", error);
    return false;
  }
}

function extractFileKeyFromUrl(url: string): string | null {
  try {
    if (url.includes('utfs.io/f/')) {
      return url.split('/f/')[1];
    } else if (url.includes('uploadthing')) {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    } else {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    }
  } catch (error) {
    console.error("Error extracting file key from URL:", url, error);
    return null;
  }
}
