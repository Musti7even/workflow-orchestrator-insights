import express from 'express';
import cors from 'cors';
import { handleApiRequest } from './api-routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Handle API requests
app.all('/api/*', async (req, res) => {
  try {
    // Convert Express request to Fetch API Request
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    const fetchRequest = new Request(url.toString(), {
      method: req.method,
      headers: new Headers(req.headers as Record<string, string>),
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
    });
    
    // Handle the request using our existing API routes
    const response = await handleApiRequest(fetchRequest);
    
    // Convert back to Express response
    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Server error handling API request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/workflows`);
});

// Export for potential testing
export default app; 