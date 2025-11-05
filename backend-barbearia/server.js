const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db.js");
const authRoutes = require("./routes/auth.routes.js");
const adminRoutes = require("./routes/admin.routes.js");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

//Middleware global
app.use(cors());
app.use(express.json());

//Teste simples para confirmar que o backend está ativo
app.get("/", (req, res) => {
  res.send("💈 API da Barbearia está rodando!");
});

//Rotas principais
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

//Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
