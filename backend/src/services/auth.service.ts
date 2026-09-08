import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { auditRepository } from '../repositories/audit.repository';
import { PasswordUtil } from '../utils/password';
import { JwtUtil, TokenPayload } from '../utils/jwt';
import { Role, UserStatus } from '@prisma/client';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: Role;
  }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw { statusCode: 409, message: 'User with this email already exists', code: 'EMAIL_IN_USE' };
    }

    const passwordHash = await PasswordUtil.hash(data.password);
    const user = await userRepository.create({
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      role: data.role || Role.ROAD_INSPECTOR,
      status: UserStatus.ACTIVE,
    });

    await auditRepository.log({
      userId: user.id,
      action: 'USER_REGISTER',
      entity: 'User',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = JwtUtil.signAccessToken(tokenPayload);
    const refreshToken = JwtUtil.signRefreshToken(tokenPayload);

    // Store hashed refresh token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await userRepository.storeRefreshToken(user.id, tokenHash, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string, ipAddress?: string) {
    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' };
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw { statusCode: 403, message: 'Account is inactive or suspended', code: 'ACCOUNT_DISABLED' };
    }

    const isValidPassword = await PasswordUtil.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' };
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = JwtUtil.signAccessToken(tokenPayload);
    const refreshToken = JwtUtil.signRefreshToken(tokenPayload);

    // Save refresh token session
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userRepository.storeRefreshToken(user.id, tokenHash, expiresAt);

    await auditRepository.log({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress,
      metadata: { email: user.email },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = JwtUtil.verifyRefreshToken(token);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const storedToken = await userRepository.findRefreshToken(tokenHash);

      if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        throw { statusCode: 401, message: 'Invalid or revoked refresh token', code: 'INVALID_TOKEN' };
      }

      // Rotate refresh token
      await userRepository.revokeRefreshToken(storedToken.id);

      const user = await userRepository.findById(payload.userId);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw { statusCode: 401, message: 'User not found or inactive', code: 'USER_INACTIVE' };
      }

      const newPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = JwtUtil.signAccessToken(newPayload);
      const newRefreshToken = JwtUtil.signRefreshToken(newPayload);

      const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await userRepository.storeRefreshToken(user.id, newTokenHash, expiresAt);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err: any) {
      throw { statusCode: 401, message: 'Invalid refresh token', code: 'INVALID_TOKEN' };
    }
  }

  async logout(token: string, userId?: string) {
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const storedToken = await userRepository.findRefreshToken(tokenHash);
      if (storedToken) {
        await userRepository.revokeRefreshToken(storedToken.id);
      }
    }

    if (userId) {
      await auditRepository.log({
        userId,
        action: 'USER_LOGOUT',
        entity: 'User',
        entityId: userId,
      });
    }
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found', code: 'USER_NOT_FOUND' };
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
