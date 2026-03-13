import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";

import { prisma } from "@/src/lib/clients/prisma";
import { updateDocumentSchema } from "@/src/lib/validations/document";

import type { NextRequest } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

async function getAuthenticatedUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  return { user };
}

async function getOwnedDocument(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    return { error: NextResponse.json({ error: "Document not found" }, { status: 404 }) };
  }

  if (document.userId !== userId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { document };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const authResult = await getAuthenticatedUser();

  if ("error" in authResult) return authResult.error;

  const result = await getOwnedDocument(id, authResult.user.id);

  if ("error" in result) return result.error;

  return NextResponse.json({ data: result.document });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const authResult = await getAuthenticatedUser();

  if ("error" in authResult) return authResult.error;

  const result = await getOwnedDocument(id, authResult.user.id);

  if ("error" in result) return result.error;

  const body: unknown = await request.json();
  const validation = updateDocumentSchema.safeParse(body);

  if (!validation.success) {
    const message = validation.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const updatedDocument = await prisma.document.update({
    where: { id },
    data: validation.data,
  });

  return NextResponse.json({ data: updatedDocument });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const authResult = await getAuthenticatedUser();

  if ("error" in authResult) return authResult.error;

  const result = await getOwnedDocument(id, authResult.user.id);

  if ("error" in result) return result.error;

  if (result.document.fileUrl && result.document.fileType !== "url") {
    try {
      await del(result.document.fileUrl);
    } catch (error) {
      console.error("[Documents] Failed to delete blob:", error);
    }
  }

  await prisma.document.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
