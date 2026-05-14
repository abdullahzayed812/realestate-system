import { Router, Request, Response } from 'express';
import { DatabaseConnection } from '@realestate/database';

const router = Router();
const db = () => DatabaseConnection.getInstance();

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'شقق',
  VILLA: 'فيلات',
  LAND: 'أراضي',
  OFFICE: 'مكاتب',
  WAREHOUSE: 'مخازن',
  FACTORY: 'مصانع',
  SHOP: 'محلات',
};

router.get('/dashboard', async (_req: Request, res: Response) => {
  const [{ rows: propRows }, { rows: userRows }, { rows: bookingRows }, { rows: byType }] =
    await Promise.all([
      db().execute<any>('SELECT COUNT(*) AS total FROM properties'),
      db().execute<any>('SELECT COUNT(*) AS total FROM users WHERE role = "CUSTOMER"'),
      db().execute<any>('SELECT COUNT(*) AS total FROM bookings'),
      db().execute<any>('SELECT type, COUNT(*) AS value FROM properties GROUP BY type'),
    ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalProperties: propRows[0]?.total ?? 0,
        totalUsers: userRows[0]?.total ?? 0,
        totalBookings: bookingRows[0]?.total ?? 0,
        totalRevenue: 0,
        propertiesChange: 0,
        usersChange: 0,
        bookingsChange: 0,
        revenueChange: 0,
      },
      propertiesByType: (byType as any[]).map((row) => ({
        key: row.type,
        name: TYPE_LABELS[row.type] ?? row.type,
        value: row.value,
      })),
      monthlyViews: [],
      recentBookings: [],
    },
  });
});

export { router as analyticsRoutes };
