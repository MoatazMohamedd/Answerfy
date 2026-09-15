import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  
  messages: ChatMessage[] = [];
  userQuery: string = '';
  isLoading: boolean = false;
  private shouldScroll = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Initialize with a welcome message
    this.messages.push({
      role: 'assistant',
      content: 'Hello! How can I help you today?',
      timestamp: new Date()
    });
    this.shouldScroll = true;
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  sendMessage(): void {
    if (!this.userQuery.trim() || this.isLoading) {
      return;
    }

    const query = this.userQuery.trim();
    this.userQuery = '';

    // Add user message
    this.messages.push({
      role: 'user',
      content: query,
      timestamp: new Date()
    });
    this.shouldScroll = true;

    // Show loading indicator
    this.isLoading = true;

    // Call API
    this.apiService.askQuestion(query).subscribe({
      next: (response: string) => {
        this.messages.push({
          role: 'assistant',
          content: response,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.shouldScroll = true;
      },
      error: (error: Error) => {
        this.messages.push({
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message}`,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.shouldScroll = true;
      }
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
