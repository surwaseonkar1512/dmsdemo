import { Router } from 'express';
import { uploadDocument, searchDocuments, downloadDocument, deleteDocument } from '../controllers/documentController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { upload } from '../middleware/multerConfig';

const router = Router();

router.use(authenticate);

router.post('/upload', authorize(['Upload']), upload.single('file'), uploadDocument);
router.get('/search', authorize(['View']), searchDocuments);
router.get('/:id/download', authorize(['Download']), downloadDocument);
router.delete('/:id', authorize(['Delete']), deleteDocument);

export default router;
