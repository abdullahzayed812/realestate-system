import { Router, Request, Response } from 'express';
import { DatabaseConnection } from '@realestate/database';

const router = Router();
const db = () => DatabaseConnection.getInstance();

router.get('/', async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
  const search = req.query.search as string | undefined;
  const isVerified = req.query.isVerified as string | undefined;

  let sql = `
    SELECT b.id, b.user_id AS userId, b.license_number AS licenseNumber,
           b.rating, b.total_ratings AS totalRatings,
           b.total_properties AS totalProperties, b.total_deals AS totalDeals,
           b.is_verified AS isVerified, b.is_featured AS isFeatured,
           b.specializations, b.service_areas AS serviceAreas,
           b.created_at AS createdAt,
           u.first_name AS firstName, u.last_name AS lastName,
           u.phone, u.email, u.avatar_url AS avatarUrl
    FROM brokers b
    JOIN users u ON u.id = b.user_id
    WHERE b.deleted_at IS NULL
  `;
  const params: unknown[] = [];

  if (search) {
    sql += ' AND (u.first_name LIKE ? OR u.last_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (isVerified !== undefined) {
    sql += ' AND b.is_verified = ?';
    params.push(isVerified === 'true' ? 1 : 0);
  }
  sql += ' LIMIT ?';
  params.push(limit);

  const { rows } = await db().query(sql, params);

  const brokers = (rows as any[]).map((row) => ({
    id: row.id,
    userId: row.userId,
    licenseNumber: row.licenseNumber,
    rating: parseFloat(row.rating) || 0,
    totalRatings: parseInt(row.totalRatings) || 0,
    totalProperties: parseInt(row.totalProperties) || 0,
    totalDeals: parseInt(row.totalDeals) || 0,
    isVerified: Boolean(row.isVerified),
    isFeatured: Boolean(row.isFeatured),
    specializations: Array.isArray(row.specializations) ? row.specializations : [],
    serviceAreas: Array.isArray(row.serviceAreas) ? row.serviceAreas : [],
    createdAt: row.createdAt,
    user: {
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
      email: row.email,
      avatarUrl: row.avatarUrl,
    },
  }));

  res.json({ success: true, data: { data: brokers, meta: { total: brokers.length } } });
});

router.patch('/:id/verify', async (req: Request, res: Response) => {
  await db().executeModify(
    'UPDATE brokers SET is_verified = ? WHERE id = ?',
    [req.body.isVerified ? 1 : 0, req.params.id],
  );
  res.json({ success: true });
});

router.patch('/:id/feature', async (req: Request, res: Response) => {
  await db().executeModify(
    'UPDATE brokers SET is_featured = ? WHERE id = ?',
    [req.body.isFeatured ? 1 : 0, req.params.id],
  );
  res.json({ success: true });
});

export { router as brokerRoutes };
