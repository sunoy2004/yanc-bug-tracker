import { useIssues } from '@/context/IssueContext';
import { Status, Severity, STATUSES, SEVERITIES } from '@/types/issue';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS: Record<Status, string> = {
  'Open': 'hsl(210, 100%, 50%)',
  'In Progress': 'hsl(38, 92%, 50%)',
  'Resolved': 'hsl(142, 71%, 45%)',
  'Reopen': 'hsl(0, 84%, 60%)',
  'To Do': 'hsl(80, 60%, 50%)',
};

const SEVERITY_COLORS: Record<Severity, string> = {
  'Low': 'hsl(210, 15%, 55%)',
  'Medium': 'hsl(38, 92%, 50%)',
  'Major': 'hsl(25, 95%, 53%)',
  'Showstopper': 'hsl(0, 84%, 60%)',
};

export function Charts() {
  const { issues } = useIssues();

  const statusData = STATUSES.map(s => ({
    name: s,
    value: issues.filter(i => i.status === s).length,
  })).filter(d => d.value > 0);

  const severityData = SEVERITIES.map(s => ({
    name: s,
    value: issues.filter(i => i.severity === s).length,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">Issues by Status</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              stroke="none"
              paddingAngle={3}
            >
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name as Status]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">Issues by Severity</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={severityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {severityData.map((entry) => (
                <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name as Severity]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
