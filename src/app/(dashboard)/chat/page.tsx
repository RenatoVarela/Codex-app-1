"use client";

import { useSearchParams } from "next/navigation";

import { ConversationList } from "@/src/components/chat/conversation-list";
import { ChatInterface } from "@/src/components/chat/chat-interface";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] md:-m-8">
      {/* Conversation list — hidden on mobile */}
      <div className="hidden w-80 shrink-0 md:block">
        <ConversationList />
      </div>

      {/* Chat interface — new conversation (no conversationId) */}
      <div className="flex-1">
        <ChatInterface
          documentId={documentId}
          showDocumentSelector={!documentId}
        />
      </div>
    </div>
  );
}
