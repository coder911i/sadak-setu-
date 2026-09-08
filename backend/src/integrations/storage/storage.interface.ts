export interface UploadResult {
  url: string;
  storageKey: string;
  sizeBytes: number;
  mimeType: string;
}

export interface IStorageService {
  uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult>;
  deleteFile(storageKey: string): Promise<void>;
  getPresignedUploadUrl?(filename: string, mimeType: string): Promise<{ uploadUrl: string; storageKey: string; publicUrl: string }>;
}
