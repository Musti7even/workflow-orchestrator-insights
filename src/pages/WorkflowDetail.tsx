
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkflowEntry, WorkflowStatus } from "@/types/workflow";
import { fetchWorkflowEntry, updateWorkflowStatus } from "@/services/api";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, FileText, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<WorkflowEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<WorkflowStatus | "">("");
  const [outcomeData, setOutcomeData] = useState("");

  useEffect(() => {
    async function loadWorkflow() {
      if (!id) return;
      
      try {
        const data = await fetchWorkflowEntry(id);
        setWorkflow(data);
        if (data?.status) {
          setNewStatus(data.status);
        }
        if (data?.outcome) {
          setOutcomeData(JSON.stringify(data.outcome, null, 2));
        }
      } catch (error) {
        console.error("Failed to fetch workflow details:", error);
        toast.error("Couldn't load workflow details");
      } finally {
        setLoading(false);
      }
    }
    
    loadWorkflow();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!workflow || !newStatus) return;
    
    setUpdating(true);
    try {
      let outcomeObject = {};
      if (outcomeData) {
        try {
          outcomeObject = JSON.parse(outcomeData);
        } catch (e) {
          toast.error("Invalid JSON in outcome data");
          setUpdating(false);
          return;
        }
      }
      
      const updatedWorkflow = await updateWorkflowStatus(
        workflow.id, 
        newStatus as WorkflowStatus,
        outcomeObject
      );
      
      if (updatedWorkflow) {
        setWorkflow({
          ...workflow,
          status: newStatus as WorkflowStatus,
          outcome: outcomeObject
        });
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Failed to update workflow status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp");
    } catch {
      return dateString;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch(type) {
      case "customer_service":
        return "Customer Service";
      case "hr":
        return "Human Resources";
      case "financial_analyst":
        return "Financial Analysis";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading workflow details...</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-2">Workflow Not Found</h2>
        <p className="mb-4">The workflow you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => navigate('/workflows')}>
          Back to All Workflows
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="h-8 w-8"
        >
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Workflow Details</h1>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {workflow.inputData.subject || `${getTypeLabel(workflow.type)} Workflow`}
                  </CardTitle>
                  <CardDescription>
                    {workflow.id}
                  </CardDescription>
                </div>
                <StatusBadge status={workflow.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDate(workflow.timestamp)}
                </span>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Type</h3>
                <p>{getTypeLabel(workflow.type)}</p>
              </div>
              
              <Separator />
              
              <Tabs defaultValue="input" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="input">Input Data</TabsTrigger>
                  <TabsTrigger value="output">
                    Output {workflow.outcome ? "" : "(None)"}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="input" className="mt-4">
                  <Card>
                    <CardHeader className="py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        <CardTitle className="text-sm">Input Data</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="bg-background/5 rounded-b-md">
                      <pre className="text-xs overflow-auto p-4 max-h-96">
                        {JSON.stringify(workflow.inputData, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="output" className="mt-4">
                  <Card>
                    <CardHeader className="py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        <CardTitle className="text-sm">Outcome Data</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="bg-background/5 rounded-b-md">
                      {workflow.outcome ? (
                        <pre className="text-xs overflow-auto p-4 max-h-96">
                          {JSON.stringify(workflow.outcome, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm p-4">No outcome data available yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
              <CardDescription>
                Change the workflow status and add outcome data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Outcome Data (JSON)</label>
                <Textarea
                  value={outcomeData}
                  onChange={(e) => setOutcomeData(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  Enter outcome data in JSON format
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={updating || !newStatus || newStatus === workflow.status}
                onClick={handleUpdateStatus}
              >
                {updating ? "Updating..." : "Update Status"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Webhook APIs</CardTitle>
              <CardDescription>
                Use these endpoints to update this workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Update Status</h4>
                <code className="text-xs bg-background/10 p-2 rounded block overflow-auto">
                  PUT /api/workflows/{workflow.id}
                </code>
                <p className="text-xs text-muted-foreground mt-1">
                  Send a PUT request with status and optional outcome
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
