import { Router } from 'express';
import { scanUrl } from '../controllers/scanController.js';

const router = Router();

router.post('/', scanUrl);

export default router;