import cors from 'cors';
import express from 'express';
import requestRoutes from './routes/request.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', requestRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
