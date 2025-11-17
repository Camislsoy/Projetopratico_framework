/// src/teste.ts
import { getDB } from "./database/mongo";

async function main() {
  try {
    const db = await getDB();

    console.log("✅ Conectado ao banco:", db.databaseName);

    const nomeColecao = "produtos"; // a coleção que você acabou de criar no mongosh

    const dados = await db.collection(nomeColecao).find({}).toArray();

    console.log(`📂 Documentos na coleção "${nomeColecao}":`);
    console.log(dados);
  } catch (error) {
    console.error("❌ Erro ao consultar Mongo:", error);
  } finally {
    process.exit(0);
  }
}

main();

