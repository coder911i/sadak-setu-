import { Router } from 'express';
import multer from 'multer';
import { MediaController } from '../controllers/media.controller';
import { authenticate } from '../middleware/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max upload
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are supported'));
    }
  },
});

const router = Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), MediaController.upload);
router.get('/:id', MediaController.getMediaById);
router.delete('/:id', MediaController.deleteMedia);

export default router;
