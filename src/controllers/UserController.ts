import { Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';
import { State } from '../models/State';
import { User } from '../models/User';
import { Ad } from '../models/Ad';
import { Category } from '../models/Category'
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt'


export const getStates = async (req: Request, res: Response) => {
    let states = await State.find();
    res.json({states});
};

export const info = async (req: Request, res: Response): Promise<void> => {

    interface ProcessedAd {
        id: string;
        status: string;
        images: string[];
        dateCreated: Date;
        title: string;
        price: number;
        priceNegotiable: boolean;
        description: string;
        views: number;
        category: string;
    }

    const token = req.query.token as string;

    // usuário baseado no token fornecido
    const user = await User.findOne({ token });
    if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
    }

    // estado associado ao usuário
    const state = await State.findById(user.state);

    //  anúncios criados pelo usuário
    const ads = await Ad.find({ idUser: user._id.toString() });

    const adList: ProcessedAd[] = [];

    // Itera sobre os anúncios para enriquecer os dados
    for (const ad of ads) {
        const cat = await Category.findOne({ slug: ad.category }); //categoria vinculada

        adList.push({
            id: ad._id.toString(),
            status: ad.status,
            images: ad.images.map((img: { url: string }) => `${process.env.BASE}/media/${img.url}`),
            dateCreated: ad.dateCreated,
            title: ad.title,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            description: ad.description,
            views: ad.views,
            category: cat?.slug || 'desconhecido'
        });
    }

    res.json({
        name: user.name,
        email: user.email,
        state: state?.name || 'desconhecido',
        ads: adList
    });
};



export const editAction = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.mapped() });
        return;
    }

    const data = matchedData(req, { locations: ['query'] });
    const user = (req as any).user;

    if (!user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
    }

    let updates: Partial<{ name: string; email: string; state: string; passwordHash: string }> = {};

    if (data.name) updates.name = data.name;

    if (data.email) {
        const emailCheck = await User.findOne({ email: data.email });
        if (emailCheck && emailCheck._id.toString() !== user._id.toString()) {
        res.status(400).json({ error: 'Email já existente' });
        return;
        }
        updates.email = data.email;
    }

    if (data.state) {
        if (!mongoose.Types.ObjectId.isValid(data.state)) {
        res.status(400).json({ error: 'ID de estado inválido' });
        return;
        }
        const stateCheck = await State.findById(data.state);
        if (!stateCheck) {
        res.status(400).json({ error: 'Estado não existe' });
        return;
        }
        updates.state = data.state;
    }

    if (data.password) {
        updates.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'Nenhum dado para atualizar' });
        return;
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updates },
        { new: true }
    );

    if (!updatedUser) {
        res.status(404).json({ error: 'Usuário não encontrado para atualização' });
        return;
    }

    res.json({ success: true });
};
