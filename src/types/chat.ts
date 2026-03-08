// Chat types — messages, citations, and streaming types

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
  createdAt: Date;
}

export interface ChatCitation {
  chunkId: string;
  text: string;
  pageNumber: number | null;
  documentId: string;
  documentTitle: string;
}

export interface StreamingState {
  isStreaming: boolean;
  partialContent: string;
}

// TODO: Define additional chat-related types
