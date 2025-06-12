import { Schema, model, models, Document } from 'mongoose';

export interface IState extends Document {
  name: string;
}

const modelSchema = new Schema<IState>({
  name: { type: String, required: true }
});

// Verifica se já existe o model para evitar erro em ambientes com hot reload
export const State = models.State || model<IState>('State', modelSchema);
