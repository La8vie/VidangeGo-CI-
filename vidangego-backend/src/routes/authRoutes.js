import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validate, authRegisterSchema, authLoginSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validate(authRegisterSchema), register);
router.post('/login', validate(authLoginSchema), login);

export default router;
