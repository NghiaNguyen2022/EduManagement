export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  badge?: string;
};

export type NavigationGroup = {
  id: string;
  label: string;
  items: NavigationItem[];
};
