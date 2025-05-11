
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowEntry } from "@/types/workflow";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  Bar, 
  BarChart, 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer,
  XAxis, 
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { CircleDollarSign, MessageSquare, User } from "lucide-react";

interface VerticalMetricsProps {
  workflows: WorkflowEntry[];
  verticalType: "customer_service" | "hr" | "financial_analyst";
}

export default function VerticalMetrics({ workflows, verticalType }: VerticalMetricsProps) {
  const [metrics, setMetrics] = useState({
    totalWorkflows: 0,
    pendingCount: 0,
    completedCount: 0,
    failedCount: 0,
    avgProcessingTime: 0,
    volumeByDay: [] as { name: string; value: number }[],
  });

  useEffect(() => {
    // Calculate core metrics
    const totalWorkflows = workflows.length;
    const pendingCount = workflows.filter(wf => wf.status === 'pending').length;
    const completedCount = workflows.filter(wf => wf.status === 'completed').length;
    const failedCount = workflows.filter(wf => wf.status === 'failed').length;
    
    // Calculate volume by day (last 7 days)
    const today = new Date();
    const lastWeek = new Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    
    const volumeByDay = lastWeek.map(day => {
      const count = workflows.filter(wf => wf.timestamp.startsWith(day)).length;
      return { 
        name: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        value: count 
      };
    });

    // Set all calculated metrics
    setMetrics({
      totalWorkflows,
      pendingCount,
      completedCount,
      failedCount,
      avgProcessingTime: calculateAvgProcessingTime(workflows),
      volumeByDay,
    });
  }, [workflows]);

  // Helper function to calculate average processing time (mocked for now)
  const calculateAvgProcessingTime = (workflows: WorkflowEntry[]): number => {
    // In a real app, we would calculate this from timestamps
    // For demo purposes, return a random number between 1-30
    return Math.floor(Math.random() * 30) + 1;
  };

  // Status data for pie chart
  const statusData = [
    { name: 'Pending', value: metrics.pendingCount, color: '#8B5CF6' },
    { name: 'Completed', value: metrics.completedCount, color: '#10B981' },
    { name: 'Failed', value: metrics.failedCount, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Top metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Workflows" 
          value={metrics.totalWorkflows} 
          description="Total number of workflows processed"
          icon={getVerticalIcon(verticalType)}
          color={getVerticalColor(verticalType)}
        />
        <MetricCard 
          title="Success Rate" 
          value={`${metrics.totalWorkflows ? Math.round((metrics.completedCount / metrics.totalWorkflows) * 100) : 0}%`} 
          description="Percentage of successfully completed workflows"
          color="text-green-500"
        />
        <MetricCard 
          title="Avg. Processing Time" 
          value={`${metrics.avgProcessingTime} min`}
          description="Average time to complete a workflow" 
          color="text-blue-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
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
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Daily Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ChartContainer
                config={{
                  volume: { color: getVerticalColor(verticalType) }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.volumeByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.7)"
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.7)" 
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem',
                        color: 'white',
                      }}
                    />
                    <Bar 
                      dataKey="value"
                      fill={getVerticalColor(verticalType)}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vertical-specific metrics */}
      <VerticalSpecificMetrics type={verticalType} workflows={workflows} />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  color?: string;
  icon?: React.ReactNode;
}

function MetricCard({ title, value, description, color = "text-white", icon }: MetricCardProps) {
  return (
    <Card className="glass-card overflow-hidden relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          {title}
          {icon && (
            <span className={`${color} opacity-70`}>
              {icon}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function VerticalSpecificMetrics({ type, workflows }: { type: string, workflows: WorkflowEntry[] }) {
  switch(type) {
    case "customer_service":
      return <CustomerServiceMetrics workflows={workflows} />;
    case "hr":
      return <HRMetrics workflows={workflows} />;
    case "financial_analyst":
      return <FinancialAnalystMetrics workflows={workflows} />;
    default:
      return null;
  }
}

function CustomerServiceMetrics({ workflows }: { workflows: WorkflowEntry[] }) {
  // In a real app, we would extract this data from the workflows
  const categories = [
    { name: 'Technical Support', value: Math.floor(Math.random() * 50) + 10 },
    { name: 'Account Issues', value: Math.floor(Math.random() * 40) + 5 },
    { name: 'Billing Inquiries', value: Math.floor(Math.random() * 30) + 15 },
    { name: 'Feature Requests', value: Math.floor(Math.random() * 20) + 5 }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-purple-400" />
          Customer Service Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Request Categories</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div key={category.name} className="bg-black/20 p-3 rounded-lg">
                  <div className="text-lg font-semibold">{category.value}</div>
                  <div className="text-xs text-muted-foreground">{category.name}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Customer Feedback</h4>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-black/10 p-3 rounded-lg border border-purple-500/10">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Customer #{Math.floor(Math.random() * 9000) + 1000}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(Date.now() - i * 3600000).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {[
                      "The automated response was very helpful and resolved my issue quickly.",
                      "I appreciate the fast turnaround time on my support request.",
                      "The AI assistant understood my problem immediately and provided a perfect solution."
                    ][i-1]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HRMetrics({ workflows }: { workflows: WorkflowEntry[] }) {
  // Mock HR metrics
  const categories = [
    { name: 'Recruitment', value: Math.floor(Math.random() * 30) + 5 },
    { name: 'Onboarding', value: Math.floor(Math.random() * 20) + 5 },
    { name: 'Performance', value: Math.floor(Math.random() * 25) + 10 },
    { name: 'Benefits', value: Math.floor(Math.random() * 15) + 5 }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5 text-blue-400" />
          Human Resources Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">HR Process Distribution</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div key={category.name} className="bg-black/20 p-3 rounded-lg">
                  <div className="text-lg font-semibold">{category.value}</div>
                  <div className="text-xs text-muted-foreground">{category.name}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Automated HR Processes</h4>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-black/10 p-3 rounded-lg border border-blue-500/10">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      {["New Employee Onboarding", "Performance Review", "Benefits Enrollment"][i-1]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(Date.now() - i * 7200000).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {[
                      "Completed onboarding process for 3 new hires in Engineering dept.",
                      "Generated and distributed Q2 performance review templates to managers.",
                      "Processed annual benefits enrollment updates for 28 employees."
                    ][i-1]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialAnalystMetrics({ workflows }: { workflows: WorkflowEntry[] }) {
  // Mock financial metrics
  const metrics = [
    { name: 'Reports Generated', value: Math.floor(Math.random() * 50) + 20 },
    { name: 'Analysis Time Saved', value: `${Math.floor(Math.random() * 100) + 50} hrs` },
    { name: 'Financial Models', value: Math.floor(Math.random() * 15) + 5 },
    { name: 'Data Sources', value: Math.floor(Math.random() * 10) + 3 }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CircleDollarSign className="mr-2 h-5 w-5 text-green-400" />
          Financial Analysis Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Analysis Performance</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <div key={metric.name} className="bg-black/20 p-3 rounded-lg">
                  <div className="text-lg font-semibold">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.name}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Financial Reports</h4>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-black/10 p-3 rounded-lg border border-green-500/10">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      {["Quarterly Forecast", "Cash Flow Analysis", "Investment Performance"][i-1]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(Date.now() - i * 8640000).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {[
                      "Automated Q3 forecast using ML prediction models based on historical data.",
                      "Generated detailed cash flow projections for next 12 months.",
                      "Analyzed investment portfolio performance across 8 market sectors."
                    ][i-1]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getVerticalIcon(type: string) {
  switch(type) {
    case "customer_service":
      return <MessageSquare className="h-5 w-5" />;
    case "hr":
      return <User className="h-5 w-5" />;
    case "financial_analyst":
      return <CircleDollarSign className="h-5 w-5" />;
    default:
      return null;
  }
}

function getVerticalColor(type: string) {
  switch(type) {
    case "customer_service":
      return "text-purple-500";
    case "hr":
      return "text-blue-500";
    case "financial_analyst":
      return "text-green-500";
    default:
      return "text-white";
  }
}
