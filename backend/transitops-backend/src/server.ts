import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import dotenv from 'dotenv';
dotenv.config();

import app from './app';

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`TransitOps backend running on http://localhost:${PORT}`);
});
