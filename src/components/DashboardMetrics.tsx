
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { WorkflowEntry } from "@/types/workflow";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

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
    { name: 'Customer Service', value: typeCount['customer_service'] || 0, color: '#9b87f5' },
    { name: 'HR', value: typeCount['hr'] || 0, color: '#0EA5E9' },
    { name: 'Financial Analyst', value: typeCount['financial_analyst'] || 0, color: '#F97316' },
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
      value: count,
      color: '#9b87f5'
    };
  });

  const chartConfig = {
    pending: { color: '#8B5CF6' },
    completed: { color: '#10B981' },
    failed: { color: '#EF4444' },
    day: { color: '#9b87f5' },
    'customer_service': { color: '#9b87f5' },
    'hr': { color: '#0EA5E9' },
    'financial_analyst': { color: '#F97316' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Metric Cards - All with consistent heights */}
      <Card className="glass-card col-span-1 h-[140px]">
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
      
      <Card className="glass-card col-span-1 h-[140px]">
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
      
      <Card className="glass-card col-span-1 h-[140px]">
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
      
      <Card className="glass-card col-span-1 h-[140px]">
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
      
      {/* Charts with equal heights */}
      <Card className="glass-card col-span-2 h-[320px]">
        <CardHeader>
          <CardTitle>Weekly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full"
            >
              <BarChart data={workflowsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.6)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border/50 bg-card/90 p-2 shadow-lg backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                            <span className="font-medium">{payload[0].payload.name}</span>
                          </div>
                          <div className="mt-1 font-mono text-sm font-medium">
                            {payload[0].value} workflows
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#colorGradient)" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={40}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9b87f5" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#9b87f5" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card col-span-2 h-[320px]">
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full"
            >
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  paddingAngle={4}
                  strokeWidth={2}
                  stroke="rgba(0,0,0,0.1)"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-foreground">{value}</span>
                  )}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border/50 bg-card/90 p-2 shadow-lg backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                            <span className="font-medium">{payload[0].payload.name}</span>
                          </div>
                          <div className="mt-1 font-mono text-sm font-medium">
                            {payload[0].value} workflows ({((payload[0].value / totalWorkflows) * 100).toFixed(0)}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
