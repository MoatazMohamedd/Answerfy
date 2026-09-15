import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { UploadedFile } from '../../models/api.models';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFiles: File[] = [];
  uploadedFiles: UploadedFile[] = [];
  isUploading: boolean = false;
  uploadProgress: number = 0;
  errorMessage: string = '';

  constructor(private apiService: ApiService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      // Filter only PDF files
      const pdfFiles = files.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length !== files.length) {
        this.errorMessage = 'Only PDF files are allowed. Non-PDF files were ignored.';
        setTimeout(() => this.errorMessage = '', 5000);
      }

      // Add to selected files
      pdfFiles.forEach(file => {
        if (!this.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
          this.selectedFiles.push(file);
        }
      });

      // Reset file input
      input.value = '';
    }
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  uploadFiles(): void {
    if (this.selectedFiles.length === 0 || this.isUploading) {
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.errorMessage = '';

    // Add files to uploaded list with pending status
    const filesToUpload: UploadedFile[] = this.selectedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      status: 'uploading',
      progress: 0
    }));

    this.uploadedFiles.push(...filesToUpload);
    const startIndex = this.uploadedFiles.length - filesToUpload.length;

    // Call API service
    this.apiService.uploadDoc(this.selectedFiles).subscribe({
      next: (result) => {
        this.uploadProgress = result.progress;

        // Update progress for all uploading files
        filesToUpload.forEach(file => {
          file.progress = result.progress;
        });

        if (result.response) {
          // Mark all files as successful
          filesToUpload.forEach(file => {
            file.status = 'success';
            file.progress = 100;
          });

          this.isUploading = false;
          this.selectedFiles = [];
          this.uploadProgress = 0;
        }
      },
      error: (error: Error) => {
        this.errorMessage = `Upload failed: ${error.message}`;
        
        // Mark all files as error
        filesToUpload.forEach(file => {
          file.status = 'error';
          file.errorMessage = error.message;
        });

        this.isUploading = false;
        this.uploadProgress = 0;
      }
    });
  }

  clearUploadedFiles(): void {
    this.uploadedFiles = [];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'uploading':
        return '⟳';
      default:
        return '○';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'uploading':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }
}
