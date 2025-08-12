import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';
import path from 'path';
import fs from 'fs';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
registerRoutes(app);

// Serve static files from dist/public
const staticPath = path.join(process.cwd(), 'dist', 'public');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
}

// Handle all other routes - serve React app
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not Found');
  }
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        return reject(err);
      }
      resolve(undefined);
    });
  });
}