import { LucideIcon } from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

export default function Sidebar({ items, activeItem, onItemClick }: SidebarProps) {
  return (
    <div className="material-card p-4">
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
