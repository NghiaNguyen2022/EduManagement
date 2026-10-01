export type TabBarItem = {
  id: string;
  label: string;
  badge?: number;
};

type TabBarProps = {
  tabs: TabBarItem[];
  activeId: string;
  onChange: (id: string) => void;
};

export function TabBar({ tabs, activeId, onChange }: TabBarProps) {
  return (
    <div className="tab-bar" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === activeId}
          className={`tab-bar__tab${
            tab.id === activeId ? " tab-bar__tab--active" : ""
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.badge !== undefined ? (
            <span className="tab-bar__badge">{tab.badge}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
