import { Schema, model, models, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
}

const modelSchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: {type: String, required: true}
});

// Verifica se já existe o model para evitar erro em ambientes com hot reload
export const Category = models.Category || model<ICategory>('Category', modelSchema);