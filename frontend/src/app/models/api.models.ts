/**
 * API Request/Response Models
 */

export interface ChatRequest {
  userQuery: string;
}

export interface ChatResponse {
  response: string;
}

export interface UploadResponse {
  message: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  errorMessage?: string;
}
