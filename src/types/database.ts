// Database types — Prisma model types and custom extensions

export type UserPlan = "free" | "premium";
export type DocumentStatus = "processing" | "ready" | "error";
export type FileType = "pdf" | "md" | "txt" | "url";
export type MessageRole = "user" | "assistant";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  createdAt: Date;
  plan: UserPlan;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  originalName: string;
  fileUrl: string;
  fileType: FileType;
  summary: string | null;
  totalChunks: number;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  chunkIndex: number;
  pageNumber: number | null;
  sectionTitle: string | null;
  tokenCount: number;
  metadata: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  userId: string;
  documentId: string | null;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  citations: Citation[];
  createdAt: Date;
}

export interface Citation {
  chunkId: string;
  text: string;
  pageNumber: number | null;
  documentTitle: string;
}
