# Answerfy

Answerfy is a Retrieval-Augmented Generation (RAG) demo application that allows users to upload company or project PDFs and then ask natural-language questions about them. The system embeds the PDF text into a vector database and retrieves the most relevant chunks to ground the language model responses.

This project is intended as a portfolio and demonstration of building an end-to-end RAG stack using modern tools:

- Backend: .NET 8 Web API (C#)
- Frontend: Angular 18
- Local LLM + embeddings via Ollama
- Vector database via Qdrant (Docker)
- PDF parsing via PDFPig

Answerfy is English-only and currently intended as a personal learning and demo project rather than a production system.

---

## Features

- Upload multiple PDF documents
- Text is chunked and embedded automatically
- Documents are stored and indexed in Qdrant
- Users can ask natural-language questions
- The system retrieves the most relevant chunks and sends them to the LLM
- Responses are always grounded in the uploaded PDFs

Conversation history is not used as context. Each question is processed independently.

---

## High-Level Architecture

Angular Frontend
|
v
.NET 8 Web API
|
v
Qdrant Vector DB <---- embeddings via Ollama
|
v
Local LLM via Ollama

---

## Tech Stack

### Backend

- .NET 8 Web API (C#)
- PDFPig for PDF parsing
- HTTP client for Ollama
- Qdrant client via REST API

### Frontend

- Angular 18.2.21

### AI / RAG

- LLM: `llama3.2:1b`
- Embeddings: `nomic-embed-text:v1.5`
- Top-5 similarity search
- Chunk size: 386 tokens
- Overlap: 50

### Vector Database

- Qdrant running in Docker

---

# Getting Started

The project runs entirely locally. You will need:

- .NET 8 SDK
- Node.js + Angular CLI
- Docker
- Ollama installed locally

---

## 1. Install and Start Ollama

Download Ollama from [https://ollama.ai](https://ollama.ai).

Then pull the required models:

```bash
ollama pull llama3.2:1b
ollama pull nomic-embed-text:v1.5
```

Make sure Ollama is running:

```bash
ollama serve
```

Default URL: http://localhost:11434

## 2. Run Qdrant via Docker

Pull and run:

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

Default dashboard: http://localhost:6333

This will persist data inside the container by default.

## 3. Run the Backend (.NET 8 API)

Navigate to the backend folder:

```bash
cd backend
```

Restore dependencies:

```bash
dotnet restore
```

Run:

```bash
dotnet run
```

Default URL: http://localhost:5000

The backend will:

- Accept PDF uploads

- Extract text with PDFPig

- Chunk text (size 386, overlap 50)

- Generate embeddings using nomic-embed-text

- Store vectors in Qdrant

- Accept user questions

- Search Qdrant (top 5)

- Send relevant context to LLM (llama3.2:1b)

- Return response

## 4. Run the Frontend

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
ng serve -o
```

The frontend provides:

- PDF upload screen

- Chat like question interface

- Simple status and error feedback

## Project Status

This project is intentionally designed as a demo and portfolio piece to showcase building an end to end RAG workflow, Future improvements may include authentication, streaming responses, richer UI and improved retrieval strategies.
