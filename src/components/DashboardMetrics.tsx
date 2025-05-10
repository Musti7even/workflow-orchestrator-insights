
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { WorkflowEntry } from "@/types/workflow";

interface MetricsProps {
  workflows: WorkflowEntry[];
}

export default function DashboardMetrics({ workflows }: MetricsProps) {
  // Calculate metrics
  const totalWorkflows = workflows.length;
  const pendingCount = workflows.filter(wf => wf.status === 'pending').length;
  const completedCount = workflows.filter(wf => wf.status === 'completed').length;
  const failedCount = workflows.filter(wf => wf.status === 'failed').length;
  
  // Get counts by type
  const typeCount = workflows.reduce((acc, workflow) => {
    acc[workflow.type] = (acc[workflow.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const typeData = [
    { name: 'Customer Service', value: typeCount['customer_service'] || 0 },
    { name: 'HR', value: typeCount['hr'] || 0 },
    { name: 'Financial Analyst', value: typeCount['financial_analyst'] || 0 },
  ];
  
  const statusData = [
    { name: 'Pending', value: pendingCount, color: '#8B5CF6' },
    { name: 'Completed', value: completedCount, color: '#10B981' },
    { name: 'Failed', value: failedCount, color: '#EF4444' },
  ];
  
  // Get data by day (last 7 days)
  const today = new Date();
  const lastWeek = new Array(7).fill(0).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  const workflowsByDay = lastWeek.map(day => {
    const count = workflows.filter(wf => wf.timestamp.startsWith(day)).length;
    return { 
      name: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
      value: count 
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="glass-card col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalWorkflows}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all departments
          </p>
        </CardContent>
      </Card>
      
      <Card className="glass-card col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-workflow-pending">{pendingCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Workflows in progress
          </p>
        </CardContent>
      </Card>
      
      <Card className="glass-card col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-workflow-completed">{completedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Successfully processed
          </p>
        </CardContent>
      </Card>
      
      <Card className="glass-card col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-workflow-failed">{failedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Require attention
          </p>
        </CardContent>
      </Card>
      
      <Card className="glass-card col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Weekly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workflowsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                  }}
                />
                <Bar dataKey="value" fill="url(#colorGradient)" />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
