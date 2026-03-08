// UI Store — sidebar state, modals, active views (Zustand)

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  activeDocumentId: string | null;
  uploadProgress: number;
}

interface UIActions {
  toggleSidebar: () => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  setActiveDocumentId: (id: string | null) => void;
  setUploadProgress: (progress: number) => void;
}

export type UIStore = UIState & UIActions;

// TODO: Implement Zustand store with create()
