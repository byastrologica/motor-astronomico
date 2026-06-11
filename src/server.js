import app from "./app.js";

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Motor Astronomico iniciado na porta ${port}.`);
});

function shutdown(signal) {
  console.log(`${signal} recebido. Encerrando o servidor.`);

  server.close(() => {
    console.log("Servidor encerrado.");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
