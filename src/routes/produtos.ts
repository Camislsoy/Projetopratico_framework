import { Router } from "express";
import { getDB } from "../database/mongo";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const produtos = await db.collection("produtos").find().toArray();
    res.json(produtos);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});

export default router;
