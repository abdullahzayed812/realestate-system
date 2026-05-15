import { Router } from 'express';
import { PropertyController } from '../controllers/PropertyController';
import { authenticate, authorize, optionalAuthenticate, validate } from '@realestate/middlewares';
import {
  createPropertySchema,
  updatePropertySchema,
  rejectPropertySchema,
} from '../dtos/property.dto';

const router = Router();
const controller = new PropertyController();

// Public routes
router.get('/', optionalAuthenticate, controller.searchProperties);
router.get('/featured', controller.getFeatured);

// Admin route — must be before /:id
router.get('/admin', authenticate, authorize('ADMIN'), controller.getAdminProperties);

router.get('/:id', optionalAuthenticate, controller.getProperty);

// Broker routes
router.post(
  '/',
  authenticate,
  authorize('BROKER', 'COMPANY'),
  validate(createPropertySchema),
  controller.createProperty,
);

router.put(
  '/:id',
  authenticate,
  authorize('BROKER', 'COMPANY', 'ADMIN'),
  validate(updatePropertySchema),
  controller.updateProperty,
);

router.delete(
  '/:id',
  authenticate,
  authorize('BROKER', 'COMPANY', 'ADMIN'),
  controller.deleteProperty,
);

router.get(
  '/broker/my-properties',
  authenticate,
  authorize('BROKER', 'COMPANY'),
  controller.getBrokerProperties,
);

// Admin routes
router.patch(
  '/:id/approve',
  authenticate,
  authorize('ADMIN'),
  controller.approveProperty,
);

router.patch(
  '/:id/reject',
  authenticate,
  authorize('ADMIN'),
  validate(rejectPropertySchema),
  controller.rejectProperty,
);

// Customer routes (favorites)
router.post(
  '/:id/favorite',
  authenticate,
  authorize('CUSTOMER'),
  controller.toggleFavorite,
);

router.get(
  '/user/favorites',
  authenticate,
  authorize('CUSTOMER'),
  controller.getFavorites,
);

export { router as propertyRoutes };
