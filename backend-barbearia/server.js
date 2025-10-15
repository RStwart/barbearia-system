const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db.js");
const authRoutes = require("./routes/auth.routes.js");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Testa conexão ao iniciar
db.connect((err) => {
  if (err) {
    console.error("❌ Erro ao conectar ao banco:", err);
  } else {
    console.log("✅ Conectado ao MySQL com sucesso!");
  }
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
