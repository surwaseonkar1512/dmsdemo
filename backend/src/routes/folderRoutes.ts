import { Router } from 'express';
import { createFolder, getFolders, renameFolder, deleteFolder } from '../controllers/folderController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['View']), getFolders);
router.post('/', authorize(['Create Folder']), createFolder);
router.put('/:id', authorize(['Rename Folder']), renameFolder);
router.delete('/:id', authorize(['Delete']), deleteFolder);

export default router;
