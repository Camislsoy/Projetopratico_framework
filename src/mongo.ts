import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://127.0.0.1:27017");

export async function getDB() {
  await client.connect();
  return client.db("meu_Banco"); 
}
