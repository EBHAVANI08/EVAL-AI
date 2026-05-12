import React from 'react';


const activities: {
  id: string;
  type: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  message: string;
  detail: string;
  time: string;
}[] = [];

export default function ActivityFeed() {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="section-header">Activity Feed</h3>
        <p className="text-xs text-muted-foreground mt-0.5">No recent activity</p>
      </div>
      <div className="divide-y divide-border">
        {activities?.map((act) => {
          const Icon = act?.icon;
          return (
            <div key={act?.id} className="flex items-start gap-3 px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${act?.iconBg}`}>
                <Icon size={14} className={act?.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-600 text-foreground leading-tight">{act?.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{act?.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{act?.time}</span>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-3 border-t border-border">
        <button className="text-xs font-600 text-primary hover:underline">View all activity →</button>
      </div>
    </div>
  );
}