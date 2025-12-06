'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'roster', label: 'Roster' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'media', label: 'Media & Highlights' },
  { id: 'reports', label: 'Reports & Recruiting' },
];

export function TeamTabs({ activeTab, onTabChange }: TeamTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="bg-[#111315] border border-white/5 w-full justify-start">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="data-[state=active]:bg-white/5 data-[state=active]:text-white"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
