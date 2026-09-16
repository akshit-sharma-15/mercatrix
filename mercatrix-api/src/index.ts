import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';

import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import vendorRoutes from './routes/vendor.routes';
import customerRoutes from './routes/customer.routes';
import checkoutRoutes from './routes/checkout.routes';
import webhooksRoutes from './routes/webhooks.routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Express = express();
const port = env.PORT;

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Mercatrix API is running...' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/webhooks', webhooksRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
