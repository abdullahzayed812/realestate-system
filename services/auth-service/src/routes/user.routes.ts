import { Router, Request, Response } from 'express';
import { DatabaseConnection } from '@realestate/database';

const router = Router();
const db = () => DatabaseConnection.getInstance();

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
  const offset = (page - 1) * limit;
  const search = req.query.search as string | undefined;
  const role = req.query.role as string | undefined;

  let where = 'WHERE 1=1';
  const params: unknown[] = [];

  if (search) {
    where += ' AND (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (role && role !== 'ALL') {
    where += ' AND role = ?';
    params.push(role);
  }

  const [{ rows }, { rows: countRows }] = await Promise.all([
    db().query(
      `SELECT id, phone, email, first_name AS firstName, last_name AS lastName,
              role, is_active AS isActive, is_verified AS isVerified,
              phone_verified AS phoneVerified, created_at AS createdAt,
              last_login_at AS lastLoginAt
       FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    ),
    db().query(`SELECT COUNT(*) AS total FROM users ${where}`, params),
  ]);

  const total = (countRows as any)[0]?.total ?? 0;

  res.json({
    success: true,
    data: {
      data: rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    },
  });
});

router.patch('/:id', async (req: Request, res: Response) => {
  await db().executeModify(
    'UPDATE users SET is_active = ? WHERE id = ?',
    [req.body.isActive ? 1 : 0, req.params.id],
  );
  res.json({ success: true });
});

export { router as userRoutes };
