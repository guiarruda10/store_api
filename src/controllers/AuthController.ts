import { Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

import { User } from '../models/User';
import { State } from '../models/State';

export const signin = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    // Verifica se existem erros de validação retornados pelo express-validator
    if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.mapped() });
        return;
    }

    // Extrai apenas os dados validados da requisição
    const data = matchedData(req);

    // validacao do email
    const user = await User.findOne({email: data.email});
    if(!user) {
        res.status(401).json({error: "Email e/ou senha inválidos"})
        return;
    }

    // validacao da senha
    const match = await bcrypt.compare(data.password, user.passwordHash);
     if(!match) {
        res.status(401).json({error: "Email e/ou senha inválidos"})
        return;
    }
    
    const token = crypto.randomBytes(32).toString('hex')
    user.token = token;
    await user.save();

    res.json({token, email: data.email});
};

export const signup = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    // verifica se existem erros de validação retornados pelo express-validator
    if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.mapped() });
        return;
    }

    // extrai apenas os dados validados da requisição
    const data = matchedData(req);

    // verifica se o e-mail já está cadastrado
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        res.status(400).json({
            error: { email: { msg: 'Email já cadastrado' } }
        });
        return;
    }

    // valida se o ID do state é um ObjectId válido e se existe no banco
    if (!mongoose.Types.ObjectId.isValid(data.state)) {
        res.status(400).json({
            error: { state: { msg: 'ID do estado inválido' } }
        });
        return;
    }

    const stateItem = await State.findById(data.state);
    if (!stateItem) {
        res.status(400).json({
            error: { state: { msg: 'Estado não existe' } }
        });
        return;
    }

    // gera hash seguro da senha
    const passwordHash = await bcrypt.hash(data.password, 10);

    // gera token criptograficamente seguro (64 caracteres hexadecimais)
    const token = crypto.randomBytes(32).toString('hex');

    // cria e salva o novo usuário
    const newUser = new User({
        name: data.name,
        email: data.email,
        passwordHash,
        token,
        state: data.state
    });

    await newUser.save();

    // retorna o token gerado para autenticação futura
    res.status(201).json({ token });
};
