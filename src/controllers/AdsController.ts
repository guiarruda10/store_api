import { v4 as uuid} from 'uuid';
import Jimp from 'jimp';
import { Request, Response } from 'express';
import { Category } from '../models/Category'
import {Ad} from '../models/Ad';
import { State } from '../models/State';
import {User} from '../models/User';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

const mediaPath = path.resolve(__dirname, '../../public/media');

const addImage = async (buffer: Buffer): Promise<string> => {
    const image = await Jimp.read(buffer);
    const newName = `${uuid()}.jpg`;

    await image
        .cover(500, 500)
        .quality(80)
        .writeAsync(`./public/media/${newName}`);

    return newName;
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
    const cats = await Category.find();

    let categories = [];

    for(let i in cats) { 
        categories.push({
            ...cats[i]._doc,
            img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`
        });
    }
    res.json({categories});
};

export const addAction = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
    if (!user) {
        res.status(401).json({ error: 'Usuário não encontrado ou token inválido.' });
        return;
    }

   let { title, price, priceneg, desc, cat } = req.body || {};

    console.log('title:', `"${title}"`, 'cat:', `"${cat}"`);

    if (!title || !title.trim() || !cat || !cat.trim()) {
        res.status(400).json({ error: 'Título e/ou categoria não foram preenchidos.' });
        return;
    }

  if (price) {
    price = price.replace(/^R\$\s*/, '');

    if (price.includes(',')) {
        price = price.replace(/\./g, '').replace(',', '.');
    }
        
        price = parseFloat(price) || 0;
    } else {
        price = 0;
    }

    const newAd = new Ad();
    newAd.status = true;
    newAd.idUser = user._id;
    newAd.state = user.state;
    newAd.dateCreated = new Date();
    newAd.title = title;
    newAd.category = cat;
    newAd.price = price;
    newAd.priceNegotiable = priceneg === 'true';
    newAd.description = desc;
    newAd.views = 0;
    newAd.images = [];

    if (req.files && req.files.img) {
        const images = Array.isArray(req.files.img) ? req.files.img : [req.files.img];

        for (let i = 0; i < images.length; i++) {
            if (['image/jpeg', 'image/jpg', 'image/png'].includes(images[i].mimetype)) {
                const url = await addImage(images[i].data);
                newAd.images.push({ url, default: false });
            }
        }
    }

    if (newAd.images.length > 0) {
        newAd.images[0].default = true;
    }

    await newAd.save();

    res.json({ id: newAd._id });
};

export const getList = async (req: Request, res: Response): Promise<void> => {
    type Image = {
        url: string;
        default: boolean;
    };

   type AdType = {
        id: number;
        title: string;
        price: number;               
        priceNegoatible: boolean;    
        image: string;
    };

    type QueryParamsTypes = {
        sort?: string;
        offset?: any;
        limit?: any;
        q?: string;
        cat?: string;
        state: string;
    }
    
    let { sort = 'asc', offset = 0, limit = 8, q, cat, state } = req.query as QueryParamsTypes;

    let filters: Record<string, any> = { status: true };

    if (q) {
        filters.title = { '$regex': q, '$options': 'i' };
    }

    if (cat) {
        const c = await Category.findOne({ slug: cat }).exec();
        if (c) {
            filters.category = c._id.toString();
        }
    }

    if (state) {
        const s = await State.findOne({ name: state.toUpperCase() }).exec();
        if (s) {
            filters.state = s._id.toString();
        }
    }

    const adsTotal = await Ad.find(filters).exec();
    const total = adsTotal.length;

    const adsData = await Ad.find(filters)
        .sort({ dateCreated: sort === 'desc' ? -1 : 1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .exec();

    let ads: AdType[] = [];
    for (let i in adsData) {
        let image;

        let defaultImg = adsData[i].images.find((e: Image) => e.default);

        if (defaultImg) {
            image = `${process.env.BASE}/media/${defaultImg.url}`;
        } else {
            image = `${process.env.BASE}/media/default.jpg`;
        }

        ads.push({
            id: adsData[i]._id,
            title: adsData[i].title,
            price: adsData[i].price,
            priceNegoatible: adsData[i].priceNegoatible,
            image
        });
    }

    res.json({ ads, total });
};

export const getItem = async (req: Request, res: Response): Promise<void> => {
    let { id, other = null } = req.query as { id?: string | string[]; other?: string; };

    if (Array.isArray(id)) {
        id = id[0];
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Id inválido' });
        console.log("ID recebido:", id);
        return;
    }
    
    const ad = await Ad.findById(id);
    if (!ad) {
        res.status(400).json({ error: 'Produto inexistente' });
        return;
    }

    ad.views++;
    await ad.save();

    let images: string[] = [];
    for (let i in ad.images) {
        images.push(`${process.env.BASE}/media/${ad.images[i].url}`);
    }

    let category = await Category.findOne({ slug: ad.category }).exec();
    let userInfo = await User.findById(ad.idUser).exec();
    let stateInfo = await State.findById(ad.state).exec();

    type OtherAd = {
        id: string;
        title: string;
        price: number;
        priceNegoatible: string;
        image: string;
    };

    let others: OtherAd[] = [];

    if (other) {
        const otherData = await Ad.find({ status: true, idUser: ad.idUser }).exec();

        type Img = {
            url: string;
            default: boolean;
        }

        for (let i in otherData) {
            if (otherData[i]._id.toString() !== ad._id.toString()) {
                let image = `${process.env.BASE}/media/default.jpg`;

                let defaultImg = otherData[i].images.find((e: Img) => e.default);
                if(defaultImg) {
                    image = `${process.env.BASE}/media/${defaultImg}`;
                }

                others.push({ 
                    id: otherData[i]._id.toString(),
                    title: otherData[i].title, 
                    price: otherData[i].price,
                    priceNegoatible: otherData[i].priceNegoatible,
                    image
                });
            }
        }
    }

    res.json({
        id: ad._id,
        title: ad.title,
        price: ad.price,
        priceNegoatible: ad.priceNegoatible,
        description: ad.description,
        dateCreated: ad.dateCreated,
        views: ad.views,
        images,
        category,
        userInfo: {
            name: userInfo?.name,
            email: userInfo?.email,
        },
        stateName: stateInfo?.name,
        others
    });
};

export const editAction = async (req: Request, res: Response): Promise<void> => {
    interface QueryParamsTypes {
        title?: string;
        status?: boolean;
        price?: string;
        priceneg?: boolean;
        desc?: string;
        cat?: string;
        images?: {
            url: string;
            default: boolean;
        };
        token: string;
    }

    interface UpdatesField {
        title?: string;
        status?: boolean;
        price?: number;
        priceneg?: boolean;
        description?: string;
        category?: string;
        token: string;
    }

    let { id } = req.params;
    let { title, status, price, priceneg, desc, cat, token } = req.body as QueryParamsTypes;
    
    if(!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({error: 'Id inválido'});
        return;
    }

    const ad = await Ad.findById(id).exec();
    if(!ad) {
        res.status(400).json({error: 'Anúncio não encontrado'});
        return;
    }

    const user = await User.findOne({token}).exec();
    if(user._id.toString() !== ad.idUser) {
        res.status(400).json({error: 'Somente o proprietário do anúncio pode editar'});
        return;
    }

    let updates = {} as UpdatesField;
    if(title) {
        updates.title = title
    }
    if(price) {
        const formattedPrice = price.replace(/\./g, '').replace(',', '.');
        updates.price = parseFloat(formattedPrice);
    }
    if(priceneg) {
        updates.priceneg = priceneg;
    }
    if(status) {
        updates.status = status;
    }
    if(desc) {
        updates.description = desc;
    }
    if(cat) {
        const category = await Category.findOne({slug: cat}).exec();
        if(!cat){
            res.status(400).json({error: 'Categoria inexistente'});
            return;
        }
        updates.category = category._id.toString();
    }

    await Ad.findByIdAndUpdate(id, {$set: updates});

    res.json({error: ''});
};