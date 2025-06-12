import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

export const privateRoute = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (typeof req.query?.token === 'string') {
        token = req.query.token;
    } else if (typeof req.body?.token === 'string') {
        token = req.body.token;
    } else if (typeof req.headers['authorization'] === 'string') {
        token = req.headers['authorization'].replace(/^Bearer\s*/i, '');
    }

    if (!token) {
        res.status(401).json({ notallowed: true });
        return;
    }

    const user = await User.findOne({ token });
    if (!user) {
        res.status(401).json({ notallowed: true });
        return;
    }

    // Armazena o user no req para ser acessado no controller
    (req as any).user = user;

    next();
};
