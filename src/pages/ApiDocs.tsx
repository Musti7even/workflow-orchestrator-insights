
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiDocs } from "@/api-routes";

export default function ApiDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">API Documentation</h1>
        <p className="text-muted-foreground">
          Use these endpoints to integrate with the workflow automation platform.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Webhook API Endpoints</CardTitle>
          <CardDescription>
            HTTP endpoints for creating and updating workflow entries via webhooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="create">Create Workflow</TabsTrigger>
              <TabsTrigger value="update">Update Workflow</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">POST /api/workflows</h3>
                <p className="text-sm text-muted-foreground">
                  Create a new workflow entry with the specified type and input data
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Request Body</h4>
                <pre className="text-xs bg-background/10 p-4 rounded overflow-auto">
{`{
  "type": "customer_service | hr | financial_analyst",
  "inputData": {
    // Object containing input data specific to the workflow type
  }
}`}
                </pre>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Example Request</h4>
                <pre className="text-xs bg-background/10 p-4 rounded overflow-auto">
{`curl -X POST /api/workflows \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "customer_service",
    "inputData": {
      "email": "customer@example.com",
      "subject": "Return Request",
      "body": "I would like to return my recent purchase."
    }
  }'`}
                </pre>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Response (201 Created)</h4>
                <pre className="text-xs bg-background/10 p-4 rounded overflow-auto">
{`{
  "id": "wf-123456789",
  "timestamp": "2025-05-10T15:32:10Z",
  "type": "customer_service",
  "inputData": {
    "email": "customer@example.com",
    "subject": "Return Request",
    "body": "I would like to return my recent purchase."
  },
  "status": "pending"
}`}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="update" className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">PUT /api/workflows/:id</h3>
                <p className="text-sm text-muted-foreground">
                  Update an existing workflow's status and add outcome data
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Request Body</h4>
                <pre className="text-xs bg-background/10 p-4 rounded overflow-auto">
{`{
  "status": "pending | completed | failed",
  "outcome": {
    // Optional object containing the workflow outcome
  }
}`}
                </pre>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Example Request</h4>
                <pre className="text-xs bg-background/10 p-4 rounded overflow-auto">
{`curl -X PUT /api/workflows/wf-123456789 \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "completed",
    "outcome": {
      "resolution": "Return approved",
      "refundAmount": 149.99,
      "refundId": "ref-12345"
    }
  }'`}
                </pre>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Response (200 OK)</h4>
                <pre className="text-xs bg-background/10 p-4 rounded overflow-auto">
{`{
  "id": "wf-123456789",
  "status": "completed",
  "outcome": {
    "resolution": "Return approved",
    "refundAmount": 149.99,
    "refundId": "ref-12345"
  },
  "updated": "2025-05-10T16:05:22Z"
}`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>
            How to integrate your applications with this platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Creating Workflows</h3>
            <p className="text-sm">
              When a new event occurs in your system that requires automation (such as receiving a customer email), 
              make a POST request to the /api/workflows endpoint with the appropriate type and input data.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Updating Workflows</h3>
            <p className="text-sm">
              After your automation processes the request, update the workflow status by making a PUT request 
              to /api/workflows/:id with the new status and outcome data.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Authentication</h3>
            <p className="text-sm">
              For production environments, authentication will be required. Contact the platform administrator 
              to obtain API keys for your integration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
