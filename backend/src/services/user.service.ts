import { userRepository } from '../repositories/user.repository';
import { auditRepository } from '../repositories/audit.repository';
import { PasswordUtil } from '../utils/password';
import { Role, UserStatus } from '@prisma/client';

export class UserService {
  async getAllUsers(params: { page?: number; limit?: number; role?: Role; status?: UserStatus }) {
    return userRepository.findAll(params);
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw { statusCode: 404, message: 'User not found', code: 'USER_NOT_FOUND' };
    }
    return user;
  }

  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: Role;
  }, adminId?: string) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw { statusCode: 409, message: 'Email already in use', code: 'EMAIL_IN_USE' };
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
      userId: adminId,
      action: 'ADMIN_USER_CREATED',
      entity: 'User',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    return user;
  }

  async updateUser(id: string, data: any, adminId?: string) {
    await this.getUserById(id);
    if (data.password) {
      data.passwordHash = await PasswordUtil.hash(data.password);
      delete data.password;
    }

    const updated = await userRepository.update(id, data);

    await auditRepository.log({
      userId: adminId,
      action: 'ADMIN_USER_UPDATED',
      entity: 'User',
      entityId: id,
      metadata: data,
    });

    return updated;
  }

  async deleteUser(id: string, adminId?: string) {
    await this.getUserById(id);
    const deleted = await userRepository.delete(id);

    await auditRepository.log({
      userId: adminId,
      action: 'ADMIN_USER_DELETED',
      entity: 'User',
      entityId: id,
    });

    return deleted;
  }
}

export const userService = new UserService();
