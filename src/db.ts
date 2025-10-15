import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.MONGO_URL;

export async function conectarBanco() {
  if (!url) {
    console.error("❌ Erro: MONGO_URL não definida no arquivo .env");
    process.exit(1);
  }

  await mongoose.connect(url, { autoIndex: true });
  console.log("✅ Conectado ao MongoDB");
}
