import { webhookCreateWorkflow, webhookUpdateWorkflow } from "./services/api";

// Import supabase client at the top
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";

export const apiRoutes = {
  // Route to create a new workflow entry
  'POST /api/workflows': async (req: Request) => {
    console.log(`[API] POST /api/workflows - New workflow creation request received`);
    try {
      const response = await webhookCreateWorkflow(req);
      return response;
    } catch (error) {
      console.error(`[API] POST /api/workflows - Error creating workflow:`, error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  // Route to update an existing workflow entry
  'PUT /api/workflows/:id': async (req: Request) => {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    console.log(`[API] PUT /api/workflows/${id} - Update request received`);
    
    try {
      const response = await webhookUpdateWorkflow(req);
      return response;
    } catch (error) {
      console.error(`[API] PUT /api/workflows/${id} - Error updating workflow:`, error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // Additional route to get all workflows (could be used later)
  'GET /api/workflows': async (req: Request) => {
    console.log(`[API] GET /api/workflows - Fetching all workflows`);
    
    try {
      const { data, error } = await supabaseAdmin
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`[API] GET /api/workflows - Database error:`, error);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Database error', 
          details: error.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`[API] GET /api/workflows - Successfully retrieved ${data.length} workflows`);
      return new Response(JSON.stringify({
        success: true,
        message: `Retrieved ${data.length} workflows`,
        data: data
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(`[API] GET /api/workflows - Error fetching workflows:`, error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  // Additional route to get a single workflow by ID
  'GET /api/workflows/:id': async (req: Request) => {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1]; // Extract ID from URL
    
    console.log(`[API] GET /api/workflows/${id} - Fetching workflow by ID`);
    
    try {
      const { data, error } = await supabaseAdmin
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        // Check if error is "not found"
        if (error.code === 'PGRST116') {
          console.error(`[API] GET /api/workflows/${id} - Workflow not found`);
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Workflow not found', 
            details: `No workflow found with ID: ${id}`
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        console.error(`[API] GET /api/workflows/${id} - Database error:`, error);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Database error', 
          details: error.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`[API] GET /api/workflows/${id} - Workflow found: Type=${data.type}, Status=${data.status}`);
      return new Response(JSON.stringify({
        success: true,
        message: `Workflow retrieved successfully`,
        data: data
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(`[API] GET /api/workflows/${id} - Error fetching workflow:`, error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

// This function would be used to handle API requests
// In a real application, this would be integrated with a server framework
export async function handleApiRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  
  console.log(`[API] ${method} ${path} - Request received`);
  
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
    console.log(`[API] ${method} ${path} - Matched route: ${routeKey}`);
    const handler = apiRoutes[routeKey as keyof typeof apiRoutes];
    return await handler(req);
  }
  
  console.log(`[API] ${method} ${path} - No matching route found`);
  return new Response(JSON.stringify({ 
    success: false,
    error: 'Not Found', 
    details: `No API endpoint exists at ${path}`
  }), {
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
