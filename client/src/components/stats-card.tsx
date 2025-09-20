import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  iconBgColor?: string;
}

export default function StatsCard({ title, value, change, icon, iconBgColor = "bg-accent/10" }: StatsCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border stats-card" data-testid={`stats-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground" data-testid={`value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
          {change && (
            <p className="text-xs text-secondary" data-testid={`change-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
