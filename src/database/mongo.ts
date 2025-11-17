// src/database/mongo.ts
import { MongoClient, Db } from "mongodb";
import "dotenv/config";

const client = new MongoClient(process.env.MONGO_URL as string);

// vamos guardar o DB em memória pra não conectar toda hora
let db: Db | null = null;

export async function getDB() {
  // se ainda não conectou, conecta uma vez só
  if (!db) {
    await client.connect();

    // como sua URL já tem /estoque no final,
    // o client.db() já pega esse banco
    db = client.db();
  }

  return db;
}
