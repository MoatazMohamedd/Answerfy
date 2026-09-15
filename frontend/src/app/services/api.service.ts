import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpParams,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import {
  ChatRequest,
  ChatResponse,
  UploadResponse,
} from "../models/api.models";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private readonly baseUrl = "http://localhost:5177/api";

  constructor(private http: HttpClient) {}

  /**
   * Sends a chat query to the backend
   * @param userQuery The user's question/query
   * @returns Observable with the response string
   */
  askQuestion(userQuery: string): Observable<string> {
    const params = new HttpParams().set('userQuery', userQuery);

    return this.http
      .get(`${this.baseUrl}/chat`, {
        params,
        responseType: "text",
      })
      .pipe(
        map((response) => response as string),
        catchError(this.handleError)
      );
  }

  /**
   * Uploads PDF files to the backend
   * @param files Array of File objects to upload
   * @returns Observable with upload progress and response
   */
  uploadDoc(
    files: File[]
  ): Observable<{ progress: number; response?: string }> {
    if (!files || files.length === 0) {
      return throwError(() => new Error("No files selected"));
    }

    const formData = new FormData();
    // Append each file with the name "files" to match [FromForm] List<IFormFile> files
    files.forEach((file) => {
      formData.append("files", file);
    });

    return this.http
      .post(`${this.baseUrl}/pdfs/upload`, formData, {
        reportProgress: true,
        observe: "events",
        responseType: "text",
      })
      .pipe(
        map((event: HttpEvent<string>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = event.total
                ? Math.round((100 * event.loaded) / event.total)
                : 0;
              return { progress };
            case HttpEventType.Response:
              // The response body is a string from the backend
              const responseText = event.body || "Upload successful";
              return {
                progress: 100,
                response: responseText,
              };
            default:
              return { progress: 0 };
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Handles HTTP errors
   * @param error The HTTP error response
   * @returns Observable error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "An unknown error occurred";

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error) {
        errorMessage += `\nDetails: ${
          typeof error.error === "string"
            ? error.error
            : JSON.stringify(error.error)
        }`;
      }
    }

    console.error("API Error Details:", {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error,
      message: errorMessage
    });
    return throwError(() => new Error(errorMessage));
  }
}
