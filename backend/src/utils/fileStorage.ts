import fs from 'fs';
import path from 'path';

const BASE_STORAGE_DIR = process.env.STORAGE_PATH || path.join(__dirname, '../../storage');

export const getOrganizationStoragePath = (organizationId: string) => {
  return path.join(BASE_STORAGE_DIR, organizationId);
};

export const createFolderDirectory = async (organizationId: string, folderPath: string) => {
  // folderPath expected to be something like "/Purchase/2026/January"
  const fullPath = path.join(getOrganizationStoragePath(organizationId), folderPath);
  if (!fs.existsSync(fullPath)) {
    await fs.promises.mkdir(fullPath, { recursive: true });
  }
  return fullPath;
};

export const saveFileToDisk = async (tempFilePath: string, organizationId: string, folderPath: string, fileName: string): Promise<string> => {
  const dirPath = await createFolderDirectory(organizationId, folderPath);
  const destinationPath = path.join(dirPath, fileName);

  await fs.promises.copyFile(tempFilePath, destinationPath);
  
  // Optionally remove the temp file here if not using multer dest that auto-cleans,
  // but usually it's good to unlink it:
  await fs.promises.unlink(tempFilePath);
  
  return destinationPath;
};

export const deleteFileFromDisk = async (filePath: string) => {
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
};

export const moveFileOnDisk = async (oldPath: string, newPath: string) => {
  const newDirPath = path.dirname(newPath);
  if (!fs.existsSync(newDirPath)) {
    await fs.promises.mkdir(newDirPath, { recursive: true });
  }
  if (fs.existsSync(oldPath)) {
    await fs.promises.rename(oldPath, newPath);
  }
};
