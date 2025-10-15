import { Schema, model, InferSchemaType, Types } from 'mongoose';

const MovimentacaoSchema = new Schema({
  idProduto:   { type: Types.ObjectId, ref: 'Produto', required: true },
  nomeProduto: { type: String, required: true, trim: true },
  tipo:        { type: String, enum: ['entrada', 'saida'], required: true },
  quantidade:  { type: Number, required: true, min: 1 },
  data:        { type: String, required: true }, // mantendo string para compatibilidade com o front
}, { timestamps: true });

export type MovimentacaoDoc = InferSchemaType<typeof MovimentacaoSchema> & { _id: string };
export const MovimentacaoModel = model('Movimentacao', MovimentacaoSchema);
