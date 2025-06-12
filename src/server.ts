import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import apiRoutes from './routes/routes';

dotenv.config();

const server = express();

// Middleware para permitir CORS
server.use(cors());

// Middleware para interpretar JSON no corpo da requisição
server.use(express.json());

// Middleware para interpretar dados de formulário urlencoded (sem arquivos)
server.use(express.urlencoded({ extended: true }));

// Middleware para upload de arquivos via multipart/form-data
server.use(fileUpload());

// Servir arquivos estáticos (ex: imagens)
server.use(express.static(path.join(__dirname, '../public')));

const DATABASE_URL = process.env.DATABASE;
if (!DATABASE_URL) {
  throw new Error('A variável de ambiente DATABASE não foi definida.');
}

// Conexão com o MongoDB
mongoose.connect(DATABASE_URL)
  .then(() => console.log('MongoDB conectado com sucesso.'))
  .catch((error) => {
    console.error('Erro ao conectar no MongoDB:', error);
    process.exit(1);
  });

// Rotas da aplicação
server.use('/', apiRoutes);

// Porta do servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em: ${process.env.BASE || `http://localhost:${PORT}`}`);
});
