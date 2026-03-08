// Navigation config — sidebar navigation items

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
}

export const navigationItems: NavItem[] = [
  { title: "Mi Biblioteca", href: "/library", icon: "library" },
  { title: "Consultar al Bibliotecario", href: "/chat", icon: "message-square" },
];
