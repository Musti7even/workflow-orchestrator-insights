import { webhookCreateWorkflow, webhookUpdateWorkflow } from "./services/api";

// Import supabase client at the top
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";

export const apiRoutes = {
  // Route to create a new workflow entry
  'POST /api/workflows': async (req: Request) => {
    return await webhookCreateWorkflow(req);
  },
  
  // Route to update an existing workflow entry
  'PUT /api/workflows/:id': async (req: Request) => {
    return await webhookUpdateWorkflow(req);
  },

  // Additional route to get all workflows (could be used later)
  'GET /api/workflows': async (req: Request) => {
    const { data, error } = await supabaseAdmin
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Additional route to get a single workflow by ID
  'GET /api/workflows/:id': async (req: Request) => {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1]; // Extract ID from URL
    
    const { data, error } = await supabaseAdmin
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// This function would be used to handle API requests
// In a real application, this would be integrated with a server framework
export async function handleApiRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  
  // Find the matching route
  const routeKey = Object.keys(apiRoutes).find(key => {
    const [routeMethod, routePath] = key.split(' ');
    
    // Check if method matches
    if (routeMethod !== method) return false;
    
    // Handle path params
    const routeParts = routePath.split('/');
    const pathParts = path.split('/');
    
    if (routeParts.length !== pathParts.length) return false;
    
    // Check if path parts match or are params
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) continue; // Skip params
      if (routeParts[i] !== pathParts[i]) return false;
    }
    
    return true;
  });
  
  if (routeKey) {
    const handler = apiRoutes[routeKey as keyof typeof apiRoutes];
    return await handler(req);
  }
  
  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Helper to document API routes for the frontend
export const apiDocs = {
  createWorkflow: {
    method: 'POST',
    url: '/api/workflows',
    description: 'Create a new workflow entry',
    body: {
      type: 'customer_service | hr | financial_analyst',
      inputData: 'Object containing input data for the workflow'
    },
    example: `
    curl -X POST /api/workflows \\
    -H "Content-Type: application/json" \\
    -d '{"type":"customer_service","inputData":{"email":"customer@example.com","subject":"Help Request"}}'
    `
  },
  updateWorkflow: {
    method: 'PUT',
    url: '/api/workflows/:id',
    description: 'Update the status of an existing workflow',
    body: {
      status: 'pending | completed | failed',
      outcome: 'Optional object containing the workflow outcome'
    },
    example: `
    curl -X PUT /api/workflows/wf-123 \\
    -H "Content-Type: application/json" \\
    -d '{"status":"completed","outcome":{"resolution":"Issue resolved","details":"Password reset complete"}}'
    `
  },
  getAllWorkflows: {
    method: 'GET',
    url: '/api/workflows',
    description: 'Get all workflow entries',
    example: `
    curl -X GET /api/workflows
    `
  },
  getWorkflowById: {
    method: 'GET',
    url: '/api/workflows/:id',
    description: 'Get a specific workflow by ID',
    example: `
    curl -X GET /api/workflows/wf-123
    `
  }
};
