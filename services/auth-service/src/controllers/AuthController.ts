import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { ApiResponse } from '@realestate/response';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  sendOtp = async (req: Request, res: Response): Promise<void> => {
    const { phone, purpose } = req.body;
    await this.authService.sendOtp(phone, purpose);
    ApiResponse.success(res, null, 'OTP sent successfully');
  };

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body);
    ApiResponse.created(res, result, 'Registration successful');
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    ApiResponse.success(res, result, 'Login successful');
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const tokens = await this.authService.refreshToken(refreshToken);
    ApiResponse.success(res, tokens, 'Token refreshed successfully');
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    await this.authService.logout(refreshToken);
    ApiResponse.success(res, null, 'Logged out successfully');
  };

  logoutAll = async (req: Request, res: Response): Promise<void> => {
    await this.authService.logoutAll(req.user!.sub);
    ApiResponse.success(res, null, 'Logged out from all devices');
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.getProfile(req.user!.sub);
    ApiResponse.success(res, user);
  };
}
