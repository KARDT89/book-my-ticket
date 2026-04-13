import { Router } from 'express';
import RegisterDto from './dto/register.dto.js';
import LoginDto from './dto/login.dto.js';
import * as controller from './controller.js'
import { authenticate } from './middleware.js';
import validate from '../../common/middleware/validate.middleware.js';


const router = Router();

router.get("/register", (req, res) => res.render("auth/register" ,{ error: null }) );
router.get("/login", (req, res) => res.render("auth/login" ,{ error: null }));

router.post('/register', validate(RegisterDto), controller.register);
router.post('/login', validate(LoginDto), controller.login);
router.post('/logout', authenticate, controller.logout);

export default router;