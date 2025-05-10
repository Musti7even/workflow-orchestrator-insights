
import { useState, useEffect } from "react";
import { WorkflowEntry, WorkflowStatus, WorkflowType } from "@/types/workflow";
import { fetchWorkflowEntries } from "@/services/api";
import WorkflowEntryComponent from "@/components/WorkflowEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WorkflowsList() {
  const [workflows, setWorkflows] = useState<WorkflowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchWorkflowEntries();
        setWorkflows(data);
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const filteredWorkflows = workflows.filter((workflow) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      JSON.stringify(workflow).toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus =
      statusFilter === "all" || workflow.status === statusFilter;

    // Filter by type
    const matchesType = 
      typeFilter === "all" || workflow.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">All Workflows</h1>
        <p className="text-muted-foreground">
          Browse and search through all workflow entries.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="customer_service">Customer Service</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="financial_analyst">Financial Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading workflows...</p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <p>No workflows found matching your filters.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map((workflow) => (
              <WorkflowEntryComponent key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
