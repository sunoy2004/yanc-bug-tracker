import { useIssues } from '@/context/IssueContext';
import { Status, Severity, STATUSES, SEVERITIES } from '@/types/issue';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const STATUS_COLORS: Record<Status, string> = {
  'Open': 'hsl(221, 83%, 53%)',
  'In Progress': 'hsl(38, 92%, 50%)',
  'Resolved': 'hsl(160, 84%, 39%)',
  'Reopen': 'hsl(347, 77%, 52%)',
  'To Do': 'hsl(142, 71%, 45%)',
};

const SEVERITY_COLORS: Record<Severity, string> = {
  'Low': 'hsl(220, 10%, 52%)',
  'Medium': 'hsl(38, 92%, 50%)',
  'High': 'hsl(25, 95%, 53%)',
  'Critical': 'hsl(347, 77%, 52%)',
};

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '12px',
  fontSize: '13px',
  padding: '8px 12px',
  boxShadow: '0 4px 16px -2px rgba(0,0,0,0.1)',
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6 shadow-card"
      >
        <h3 className="text-section-header text-foreground mb-1">Issues by Status</h3>
        <p className="text-body text-muted-foreground mb-4">Distribution across all statuses</p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              dataKey="value"
              stroke="hsl(var(--card))"
              strokeWidth={3}
              paddingAngle={4}
              animationBegin={200}
              animationDuration={800}
            >
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name as Status]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border p-6 shadow-card"
      >
        <h3 className="text-section-header text-foreground mb-1">Issues by Severity</h3>
        <p className="text-body text-muted-foreground mb-4">Breakdown of issue severity levels</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={severityData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              maxBarSize={56}
              animationBegin={300}
              animationDuration={800}
            >
              {severityData.map((entry) => (
                <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name as Severity]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
