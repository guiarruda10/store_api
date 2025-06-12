import { Schema, model, models, Document } from 'mongoose';


export interface IUser extends Document {
  name: string;
  email: string;
  state: string;
  passwordHash: string;
  token: string;
}


const modelSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  state: { type: String },
  passwordHash: { type: String, required: true },
  token: { type: String }
});

// Verifica se já existe o model para evitar erro em ambientes com hot reload
export const User = models.User || model<IUser>('User', modelSchema);
