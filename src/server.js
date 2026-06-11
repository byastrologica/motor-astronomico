import express from "express";
import cors from "cors";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/", (request, response) => {
  response.status(200).json({
    service: "Motor Astronomico",
    version: "1.0.0",
    status: "online",
    description: "API publica de dados astronomicos",
  });
});

app.get("/health", (request, response) => {
  response.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use((request, response) => {
  response.status(404).json({
    error: "NOT_FOUND",
    message: "Rota nao encontrada.",
  });
});

app.use((error, request, response, next) => {
  console.error(error);

  response.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "Ocorreu um erro interno.",
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Motor Astronomico iniciado na porta ${port}.`);
});
