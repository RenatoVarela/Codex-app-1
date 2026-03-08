// Theme Store — light/dark mode preference (Zustand)

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

// TODO: Implement Zustand store with create() + persist middleware
