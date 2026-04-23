'use client';

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface UserTrendPoint {
  readonly date: string;
  readonly users: number;
}

interface UserTrendChartProps {
  readonly data: ReadonlyArray<UserTrendPoint>;
}

interface TooltipProps {
  readonly active?: boolean;
  readonly label?: string;
  readonly payload?: ReadonlyArray<{
    readonly value?: number | string;
  }>;
}

function TrendTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const users = Number(payload[0]?.value ?? 0);

  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-1 text-sm text-text-primary">{users.toLocaleString()} registered</p>
    </div>
  );
}

export function UserTrendChart({ data }: UserTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 2 }}>
        <XAxis hide dataKey="date" />
        <YAxis hide domain={["dataMin - 400", "dataMax + 400"]} />
        <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'rgba(0, 217, 146, 0.28)' }} />
        <Line
          type="monotone"
          dataKey="users"
          stroke="#00d992"
          strokeWidth={2.2}
          dot={false}
          activeDot={{ r: 4, fill: '#00d992', stroke: '#050507', strokeWidth: 1 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
