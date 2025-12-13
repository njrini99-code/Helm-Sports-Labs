'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const COLORS = {
  primary: '#10b981', // emerald-500
  secondary: '#3b82f6', // blue-500
  accent: '#8b5cf6', // purple-500
  warning: '#f59e0b', // amber-500
  success: '#22c55e', // green-500
  danger: '#ef4444', // red-500
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.warning,
  COLORS.success,
  COLORS.danger,
];

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface AdvancedLineChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  title?: string;
  color?: string;
  showArea?: boolean;
  className?: string;
}

export function AdvancedLineChart({
  data,
  dataKey,
  title,
  color = COLORS.primary,
  showArea = false,
  className,
}: AdvancedLineChartProps) {
  const ChartComponent = showArea ? AreaChart : LineChart;
  const DataComponent = showArea ? Area : Line;

  return (
    <Card className={cn('', className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
)}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fill: '#64748b' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            {showArea ? (
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                fill={color}
                fillOpacity={0.2}
                strokeWidth={2} />
            ) : (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                activeDot={{ r: 6 }} />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface MultiLineChartProps {
  data: ChartDataPoint[];
  dataKeys: string[];
  title?: string;
  colors?: string[];
  className?: string;
}

export function MultiLineChart({
  data,
  dataKeys,
  title,
  colors = CHART_COLORS,
  className,
}: MultiLineChartProps) {
  return (
    <Card className={cn('', className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
)}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fill: '#64748b' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {dataKeys.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], r: 3 }}
                activeDot={{ r: 5 }} />
            ))
          )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface BarChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  title?: string;
  color?: string;
  horizontal?: boolean;
  className?: string;
}

export function AdvancedBarChart({
  data,
  dataKey,
  title,
  color = COLORS.primary,
  horizontal = false,
  className,
}: BarChartProps) {
  return (
    <Card className={cn('', className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
)}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            {horizontal ? (
              <>
                <XAxis type="number" className="text-xs" tick={{ fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" className="text-xs" tick={{ fill: '#64748b' }} width={100} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" className="text-xs" tick={{ fill: '#64748b' }} />
                <YAxis className="text-xs" tick={{ fill: '#64748b' }} />
              </>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface PieChartProps {
  data: ChartDataPoint[];
  title?: string;
  colors?: string[];
  className?: string;
}

export function AdvancedPieChart({
  data,
  title,
  colors = CHART_COLORS,
  className,
}: PieChartProps) {
  return (
    <Card className={cn('', className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
)}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ComparisonChartProps {
  data: ChartDataPoint[];
  currentKey: string;
  previousKey: string;
  title?: string;
  className?: string;
}

export function ComparisonChart({
  data,
  currentKey,
  previousKey,
  title,
  className,
}: ComparisonChartProps) {
  return (
    <Card className={cn('', className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
)}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fill: '#64748b' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey={currentKey} fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Current Period" />
            <Bar dataKey={previousKey} fill={COLORS.secondary} radius={[4, 4, 0, 0]} name="Previous Period" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

