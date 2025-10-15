import { Schema, model, InferSchemaType } from 'mongoose';

const ProdutoSchema = new Schema({
  nome: { type: String, required: true, trim: true },
  quantidade: { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: true });

export type ProdutoDoc = InferSchemaType<typeof ProdutoSchema> & { _id: string };
export const ProdutoModel = model('Produto', ProdutoSchema);
