import { checkSchema } from 'express-validator';

// Middleware de validação para a rota de cadastro (/signup).
export const signup = checkSchema({
  name: {
    trim: true,
    isLength: {
      options: { min: 2 },
      errorMessage: 'Nome precisa ter 2 ou mais caracteres'
    }
  },
  email: {
    isEmail: {
      errorMessage: 'Email inválido'
    },
    normalizeEmail: true // Converte email para formato padrão (ex: remove espaços, caixa baixa)
  },
  password: {
    isLength: {
      options: { min: 2 },
      errorMessage: 'Senha precisa ter 2 ou mais caracteres'
    }
  },
  state: {
    notEmpty: {
      errorMessage: 'Estado não preenchido'
    }
  }
});


export const signin = checkSchema({
  email: {
    isEmail: {
      errorMessage: 'Email inválido',
    },
    normalizeEmail: true
  },
  password: {
    isLength: {
      options: { min: 2 },
      errorMessage: 'Senha precisa ter 2 ou mais caracteres'
    }
  }
});


