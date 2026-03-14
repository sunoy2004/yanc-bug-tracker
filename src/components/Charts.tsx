import { useIssues } from '@/context/IssueContext';
import { Status, Severity, STATUSES, SEVERITIES, ISSUE_TYPES, DEVICES } from '@/types/issue';
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

const ISSUE_TYPE_COLORS: Record<string, string> = {
  'Bug': 'hsl(347, 77%, 52%)',
  'Enhancement': 'hsl(160, 84%, 39%)',
  'Working as Expected': 'hsl(221, 83%, 53%)',
};

const DEVICE_COLORS: Record<string, string> = {
  'Desktop': 'hsl(221, 83%, 53%)',
  'Tablet': 'hsl(38, 92%, 50%)',
  'Mobile': 'hsl(160, 84%, 39%)',
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

  const issueTypeData = ISSUE_TYPES.map(t => ({
    name: t,
    value: issues.filter(i => i.issueType === t).length,
  })).filter(d => d.value > 0);

  const deviceData = DEVICES.map(d => ({
    name: d,
    value: issues.filter(i => i.device === d).length,
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 w-full min-w-0">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-card min-w-0 overflow-hidden"
      >
        <h3 className="text-section-header text-foreground mb-1 text-base sm:text-lg">Issues by Status</h3>
        <p className="text-body text-muted-foreground mb-3 sm:mb-4 text-sm">Distribution across all statuses</p>
        <ResponsiveContainer width="100%" height={280}>
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
        className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-card min-w-0 overflow-hidden"
      >
        <h3 className="text-section-header text-foreground mb-1 text-base sm:text-lg">Issues by Severity</h3>
        <p className="text-body text-muted-foreground mb-3 sm:mb-4 text-sm">Breakdown of issue severity levels</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={severityData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={8}>
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

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-card min-w-0 overflow-hidden"
      >
        <h3 className="text-section-header text-foreground mb-1 text-base sm:text-lg">Issues by Type</h3>
        <p className="text-body text-muted-foreground mb-3 sm:mb-4 text-sm">Bug, Enhancement, or Working as Expected</p>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={issueTypeData.length ? issueTypeData : ISSUE_TYPES.map(t => ({ name: t, value: 0 }))}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              dataKey="value"
              stroke="hsl(var(--card))"
              strokeWidth={3}
              paddingAngle={4}
              animationBegin={250}
              animationDuration={800}
            >
              {(issueTypeData.length ? issueTypeData : ISSUE_TYPES.map(t => ({ name: t, value: 0 }))).map((entry) => (
                <Cell key={entry.name} fill={ISSUE_TYPE_COLORS[entry.name] ?? 'hsl(var(--muted))'} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-card min-w-0 overflow-hidden"
      >
        <h3 className="text-section-header text-foreground mb-1 text-base sm:text-lg">Issues by Device</h3>
        <p className="text-body text-muted-foreground mb-3 sm:mb-4 text-sm">Desktop, Tablet, or Mobile</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={deviceData} barGap={8}>
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
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56} animationBegin={350} animationDuration={800}>
              {deviceData.map((entry) => (
                <Cell key={entry.name} fill={DEVICE_COLORS[entry.name] ?? 'hsl(var(--muted))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
