import { DashboardCards } from '@/components/DashboardCards';
import { Charts } from '@/components/Charts';

const Dashboard = () => {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of all tracked issues</p>
      </div>
      <DashboardCards />
      <Charts />
    </div>
  );
};

export default Dashboard;
