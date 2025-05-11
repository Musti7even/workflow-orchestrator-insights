import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowEntry } from "@/types/workflow";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { CircleDollarSign, MessageSquare, User } from "lucide-react";

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
    { name: 'Financial Analysis', value: typeCount['financial_analyst'] || 0, color: '#10B981' },
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      
      <Card className="glass-card col-span-2 md:row-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Vertical Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ChartContainer
              config={{
                customerService: { color: "#9b87f5" },
                hr: { color: "#0EA5E9" },
                financialAnalyst: { color: "#10B981" }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={5}
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            {typeData.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card col-span-2 md:row-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ChartContainer
              config={{
                pending: { color: "#8B5CF6" },
                completed: { color: "#10B981" },
                failed: { color: "#EF4444" }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            {statusData.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CircleDollarSign className="mr-2 h-5 w-5" />
            Weekly Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Increased height for better display */}
          <div className="h-[300px]">
            <ChartContainer
              config={{
                volume: { color: "#8B5CF6" }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                {/* BarChart with appropriate margins */}
                <BarChart 
                  data={workflowsByDay} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.7)" 
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)" 
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {/* Bar with controlled width */}
                  <Bar 
                    dataKey="value"
                    fill="#8B5CF6" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
