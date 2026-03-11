import { PDFParse } from "pdf-parse";

import type { ParsedDocument } from "@/src/types/rag";

const EXCESSIVE_WHITESPACE_REGEX = /[ \t]{2,}/g;
const EXCESSIVE_NEWLINES_REGEX = /\n{3,}/g;

export async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  const [textResult, infoResult] = await Promise.all([
    parser.getText(),
    parser.getInfo(),
  ]);

  let content = textResult.text || "";
  content = content
    .replace(EXCESSIVE_WHITESPACE_REGEX, " ")
    .replace(EXCESSIVE_NEWLINES_REGEX, "\n\n")
    .trim();

  if (!content) {
    console.warn("[Parsers] PDF produced empty text");
  }

  const title = infoResult.info?.Title
    ? String(infoResult.info.Title)
    : undefined;

  const pageCount = infoResult.total || textResult.total;

  await parser.destroy();

  return {
    content,
    metadata: {
      title,
      pageCount,
    },
  };
}
