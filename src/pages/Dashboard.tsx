import { DashboardCards } from '@/components/DashboardCards';
import { Charts } from '@/components/Charts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-8 max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-page-title text-foreground">Dashboard</h1>
        <p className="text-body-lg text-muted-foreground mt-1">Overview of all tracked issues and project health</p>
      </motion.div>
      <DashboardCards />
      <Charts />
    </div>
  );
};

export default Dashboard;
