import { checkSchema } from 'express-validator';

export const editAction = checkSchema({
  token: {
    in: ['query'],
    notEmpty: true,
    errorMessage: 'Token obrigatório'
  },
  name: {
    in: ['query'],
    optional: true,
    trim: true,
    custom: {
      options: (value) => {
        if (!value || value.trim().length < 2) throw new Error('Nome inválido');
        if (!/^[\p{L}\s]+$/u.test(value)) throw new Error('Nome deve conter apenas letras e espaços');
        return true;
      }
    }
  },
  email: {
    in: ['query'],
    optional: true,
    isEmail: {
      errorMessage: 'Email inválido'
    },
    normalizeEmail: true
  },
  state: {
    in: ['query'],
    optional: true,
    isString: true,
    errorMessage: 'Estado inválido'
  },
  password: {
    in: ['query'],
    optional: true,
    isLength: {
      options: { min: 6 },
      errorMessage: 'Senha deve ter no mínimo 6 caracteres'
    }
  }
});
