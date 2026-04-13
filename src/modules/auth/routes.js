import { Router } from 'express';
import RegisterDto from './dto/register.dto.js';
import LoginDto from './dto/login.dto.js';


const router = Router();

// router.post('/register', validate(RegisterDto), controller.register);
// router.post('/login', validate(LoginDto), controller.login);
// router.post('/logout', authenticate, controller.logout);

export default router;