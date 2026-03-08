// Chat Store — draft input, active document selection (Zustand)

interface ChatState {
  draftInput: string;
  selectedDocumentId: string | null;
  isStreaming: boolean;
}

interface ChatActions {
  setDraftInput: (input: string) => void;
  setSelectedDocumentId: (id: string | null) => void;
  setIsStreaming: (streaming: boolean) => void;
  clearDraft: () => void;
}

export type ChatStore = ChatState & ChatActions;

// TODO: Implement Zustand store with create()
