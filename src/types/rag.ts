// RAG types — chunks, embeddings, and pipeline types

export interface ParsedDocument {
  content: string;
  metadata: {
    title?: string;
    pageCount?: number;
    sections?: string[];
  };
}

export interface TextChunk {
  content: string;
  index: number;
  pageNumber: number | null;
  sectionTitle: string | null;
  tokenCount: number;
}

export interface EmbeddedChunk extends TextChunk {
  embedding: number[];
}

export interface RetrievedChunk {
  id: string;
  content: string;
  score: number;
  documentId: string;
  pageNumber: number | null;
  sectionTitle: string | null;
}

export interface RerankedChunk extends RetrievedChunk {
  rerankScore: number;
}

export interface PipelineOptions {
  topK?: number;
  semanticWeight?: number;
  documentId?: string | null;
}

// TODO: Define additional RAG pipeline types
