import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  // ---------------- GET USERS ----------------

  it('should return all users without password', async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      { id: 1, email: 'test@test.com', name: 'Test' },
    ]);

    const result = await service.getUsers();

    expect(result.length).toBe(1);
    expect(result[0]).not.toHaveProperty('password');
    expect(prisma.user.findMany).toHaveBeenCalled();
  });

  // ---------------- GET BY ID ----------------

  it('should return user by id', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      name: 'Test',
    });

    const user = await service.getById(1);

    expect(user.id).toBe(1);
    expect(user.email).toBe('test@test.com');
  });

  it('should throw if user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(service.getById(1)).rejects.toThrow(HttpException);
  });

  // ---------------- CREATE ----------------

  it('should create user with hashed password', async () => {
    jest.spyOn(service, 'existsUser').mockResolvedValue(false);

    mockPrisma.user.create.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      name: 'Test',
    });

    const result = await service.createUser({
      email: 'test@test.com',
      password: 'password123',
      name: 'Test',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(result.email).toBe('test@test.com');
  });

  it('should throw if user with email exists', async () => {
    jest.spyOn(service, 'existsUser').mockResolvedValue(true);

    await expect(
      service.createUser({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
      }),
    ).rejects.toThrow(HttpException);
  });

  // ---------------- UPDATE ----------------

  it('should update user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'old@test.com',
      name: 'Old',
    });
    jest.spyOn(service, 'existsUser').mockResolvedValue(false);
    mockPrisma.user.update.mockResolvedValue({
      id: 1,
      email: 'new@test.com',
      name: 'New',
    });

    const result = await service.updateUser(
      { email: 'new@test.com', name: 'New' },
      1,
    );

    expect(result.name).toBe('New');
  });

  it('should hash password when updating', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      name: 'Test',
    });
    mockPrisma.user.update.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      name: 'Test',
    });

    await service.updateUser(
      { password: 'newPassword123' },
      1,
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
  });

  it('should throw if user not found when updating', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.updateUser({ name: 'New' }, 1),
    ).rejects.toThrow(HttpException);
  });

  // ---------------- DELETE ----------------

  it('should delete user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.user.delete.mockResolvedValue({ id: 1 });

    await service.destroy(1);

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should throw when deleting missing user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(service.destroy(1)).rejects.toThrow(HttpException);
  });
});
