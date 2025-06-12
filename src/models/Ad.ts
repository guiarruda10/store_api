import { Schema, model, models, Document } from 'mongoose';

export interface IAd extends Document {
  idUser: string; 
  state: string; 
  category: string; 
  images: { url: string; default: boolean }[]; // Array de imagens com a URL e o status de default
  dateCreated: Date; 
  title: string; 
  price: number; 
  priceNegotiable: boolean; 
  description: string; 
  views: number; 
  status: string;
}


const modelSchema = new Schema<IAd>({
  idUser: { type: String, required: true }, 
  state: { type: String, required: true }, 
  category: { type: String, required: true }, 
  images: [{ url: { type: String }, default: { type: Boolean, default: true } }],
  dateCreated: { type: Date, default: Date.now },
  title: { type: String, required: true }, 
  price: { type: Number, required: true }, 
  priceNegotiable: { type: Boolean, required: true }, 
  description: { type: String, required: true }, 
  views: { type: Number, default: 0 }, 
  status: { type: String, required: true } 
});

// Verifica se o model já existe para evitar erro em ambientes com hot reload
export const Ad = models.Ad || model<IAd>('Ad', modelSchema);
