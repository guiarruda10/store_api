import { Request, Response } from 'express';
import { Router } from 'express';

import * as AuthController from '../controllers/AuthController';
import * as UserController from '../controllers/UserController';
import * as AdsController from '../controllers/AdsController';

import * as Auth from '../middlewares/Auth';
import * as AuthValidator from '../validators/AuthValidator';
import * as UserValidator from '../validators/userValidator';

const router = Router();

router.get('/ping',(req: Request, res: Response) => {
    res.status(200).json({pong: true})
});

// Listagem dos estados
router.get('/states', UserController.getStates);

// Processo de login/cadastro
router.post('/user/signin', AuthValidator.signin, AuthController.signin);
router.post('/user/signup', AuthValidator.signup, AuthController.signup);

// listagem de usuarios
router.get('/user/me', Auth.privateRoute, UserController.info)
router.put('/user/me', UserValidator.editAction, Auth.privateRoute, UserController.editAction)

// listagem de categorias
router.get('/categories', AdsController.getCategories);

// informaçoes dos ads
router.post('/ad/add', Auth.privateRoute, AdsController.addAction);
router.get('/ad/list', AdsController.getList);
router.get('/ad/item', AdsController.getItem);
router.post('/ad/:id',  Auth.privateRoute, AdsController.editAction);

export default router;
