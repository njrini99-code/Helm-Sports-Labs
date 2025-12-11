'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Calendar,
  Loader2,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  getPlayerEngagementSummary,
  getPlayerViewTrend,
  getTopViewingCoaches,
  getEngagementComparison,
  type EngagementSummary,
  type ViewTrend,
} from '@/lib/queries/analytics';
import { formatDistanceToNow } from 'date-fns';
import { AdvancedLineChart, AdvancedPieChart, ComparisonChart } from '@/components/analytics/AdvancedCharts';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface AnalyticsDashboardProps {
  playerId: string;
  timeRange?: 7 | 30 | 90;
}

interface TopCoach {
  coach_id: string;
  full_name: string | null;
  program_name: string | null;
  division_level: string | null;
  view_count: number;
  last_viewed: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function AnalyticsDashboard({ playerId, timeRange = 30 }: AnalyticsDashboardProps) {
  const [summary, setSummary] = useState<EngagementSummary | null>(null);
  const [trend, setTrend] = useState<ViewTrend[]>([]);
  const [topCoaches, setTopCoaches] = useState<TopCoach[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(timeRange);

  useEffect(() => {
    loadAnalytics();
  }, [playerId, selectedRange]);

  const loadAnalytics = async () => {
    setLoading(true);

    const [summaryData, trendData, coachesData, comparisonData] = await Promise.all([
      getPlayerEngagementSummary(playerId, selectedRange),
      getPlayerViewTrend(playerId, selectedRange),
      getTopViewingCoaches(playerId, selectedRange, 5),
      getEngagementComparison(playerId, selectedRange === 7 ? 7 : 30),
    ]);

    setSummary(summaryData);
    setTrend(trendData);
    setTopCoaches(coachesData);
    setComparison(comparisonData);
    setLoading(false);
  };

  const handleExport = () => {
    // Create CSV content
    const csvRows = [];
    
    // Summary data
    csvRows.push('Metric,Value,Change');
    csvRows.push(`Profile Views,${summary?.total_views || 0},${comparison?.change?.views || 0}%`);
    csvRows.push(`Unique Coaches,${summary?.unique_coaches || 0},${comparison?.change?.coaches || 0}%`);
    csvRows.push(`Watchlist Adds,${summary?.total_watchlist_adds || 0},${comparison?.change?.watchlist_adds || 0}%`);
    csvRows.push(`Video Views,${summary?.total_video_views || 0},0%`);
    csvRows.push('');
    
    // Trend data
    csvRows.push('Date,Views,Unique Coaches');
    trend.forEach(day => {
      csvRows.push(`${day.view_date},${day.view_count},${day.unique_coaches}`);
    });
    csvRows.push('');
    
    // Top coaches
    csvRows.push('Coach Name,Program,Views,Last Viewed');
    topCoaches.forEach(coach => {
      csvRows.push(`"${coach.full_name || 'Unknown'}","${coach.program_name || 'Unknown'}",${coach.view_count},"${coach.last_viewed}"`);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <GlassCard className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#00C27A]" />
          <span className="ml-3 text-slate-600">Loading analytics...</span>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#00C27A]" />
            Your Recruiting Analytics
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            See how coaches are engaging with your profile
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedRange(days as 7 | 30 | 90)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedRange === days
                    ? 'bg-[#00C27A] text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white/60 text-slate-600 hover:bg-white/80'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="bg-white/60 hover:bg-white/80"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Eye className="h-5 w-5" />}
          label="Profile Views"
          value={summary?.total_views || 0}
          change={comparison?.change?.views || 0}
          color="blue"
        />
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="Unique Coaches"
          value={summary?.unique_coaches || 0}
          change={comparison?.change?.coaches || 0}
          color="purple"
        />
        <MetricCard
          icon={<Star className="h-5 w-5" />}
          label="Watchlist Adds"
          value={summary?.total_watchlist_adds || 0}
          change={comparison?.change?.watchlist_adds || 0}
          color="yellow"
        />
        <MetricCard
          icon={<Activity className="h-5 w-5" />}
          label="Video Views"
          value={summary?.total_video_views || 0}
          change={0}
          color="green"
        />
      </div>

      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart for View Trend */}
        <AdvancedLineChart
          data={trend.map(day => ({
            name: new Date(day.view_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: day.view_count,
            coaches: day.unique_coaches,
          }))}
          dataKey="value"
          title="Profile Views Over Time"
          showArea={true}
        />

        {/* Top Viewing Coaches */}
        <TopCoachesCard coaches={topCoaches} />
      </div>

      {/* Additional Charts Row */}
      {topCoaches.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart for Coach Distribution */}
          <AdvancedPieChart
            data={topCoaches.map(coach => ({
              name: coach.program_name || 'Unknown',
              value: coach.view_count,
            }))}
            title="Views by Program"
          />

          {/* Comparison Chart if comparison data exists */}
          {comparison && (
            <ComparisonChart
              data={[
                {
                  name: 'Views',
                  value: 0,
                  current: summary?.total_views || 0,
                  previous: (summary?.total_views || 0) - (comparison.change?.views || 0),
                },
              ]}
              currentKey="current"
              previousKey="previous"
              title="Period Comparison"
            />
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  change: number;
  color: 'blue' | 'purple' | 'yellow' | 'green';
}

function MetricCard({ icon, label, value, change, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-50',
    purple: 'text-purple-500 bg-purple-50',
    yellow: 'text-yellow-500 bg-yellow-50',
    green: 'text-[#00C27A] bg-emerald-50',
  };

  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <GlassCard className="p-5 hover:scale-[1.02] transition-transform cursor-default">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {change !== 0 && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            {isPositive && <TrendingUp className="h-3 w-3" />}
            {isNegative && <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-slate-800">{value.toLocaleString()}</div>
        <div className="text-sm text-slate-600 mt-1">{label}</div>
      </div>
    </GlassCard>
  );
}

function ViewTrendChart({ trend }: { trend: ViewTrend[] }) {
  if (!trend || trend.length === 0) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#00C27A]" />
          View Trend
        </h3>
        <div className="text-center py-8 text-slate-500">
          No view data available for the selected period
        </div>
      </GlassCard>
    );
  }

  const maxViews = Math.max(...trend.map((d) => d.view_count), 1);

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-[#00C27A]" />
        View Trend
      </h3>

      <ScrollArea className="w-full">
        <div className="space-y-3 pr-4">
          {trend.slice(0, 14).reverse().map((day, index) => {
            const percentage = (day.view_count / maxViews) * 100;
            const date = new Date(day.view_date);
            const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <div key={index} className="flex items-center gap-3">
                <div className="text-xs text-slate-600 w-16 text-right">{dateLabel}</div>
                <div className="flex-1 h-8 bg-slate-100 rounded-2xl overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#00C27A] to-emerald-400 rounded-2xl transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3 text-xs font-medium text-slate-700">
                    {day.view_count} {day.view_count === 1 ? 'view' : 'views'}
                  </div>
                </div>
                <div className="text-xs text-slate-500 w-12">
                  {day.unique_coaches > 0 && `${day.unique_coaches}🎓`}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}

function TopCoachesCard({ coaches }: { coaches: TopCoach[] }) {
  if (!coaches || coaches.length === 0) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-[#00C27A]" />
          Who's Viewing
        </h3>
        <div className="text-center py-8 text-slate-500">
          No coaches have viewed your profile yet
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-[#00C27A]" />
        Who's Viewing
      </h3>

      <ScrollArea className="h-[280px]">
        <div className="space-y-3 pr-4">
          {coaches.map((coach, index) => {
            const initials = coach.full_name
              ? coach.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
              : '?';

            return (
              <div
                key={coach.coach_id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 hover:bg-white/70 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10 border-2 border-emerald-200">
                    <AvatarFallback className="bg-gradient-to-br from-[#00C27A] to-emerald-600 text-white text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 truncate">
                      {coach.full_name || 'Anonymous Coach'}
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {coach.program_name || 'Unknown Program'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    {coach.view_count} {coach.view_count === 1 ? 'view' : 'views'}
                  </Badge>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(coach.last_viewed), { addSuffix: true })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}
