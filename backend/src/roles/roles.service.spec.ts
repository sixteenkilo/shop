import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: PrismaService;

  const mockPrisma = {
    role: {
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
        RolesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  // ---------------- GET ROLES ----------------

  it('should return all roles', async () => {
    mockPrisma.role.findMany.mockResolvedValue([{ id: 1, value: 'ADMIN' }]);

    const result = await service.getRoles();

    expect(result.length).toBe(1);
    expect(prisma.role.findMany).toHaveBeenCalled();
  });

  // ---------------- GET BY ID ----------------

  it('should return role by id', async () => {
    mockPrisma.role.findUnique.mockResolvedValue({
      id: 1,
      value: 'ADMIN',
    });

    const role = await service.getById(1);

    expect(role.id).toBe(1);
  });

  it('should throw if role not found', async () => {
    mockPrisma.role.findUnique.mockResolvedValue(null);

    await expect(service.getById(1)).rejects.toThrow(HttpException);
  });

  // ---------------- CREATE ----------------

  it('should create role', async () => {
    jest.spyOn(service, 'existsRole').mockResolvedValue(false);

    mockPrisma.role.create.mockResolvedValue({
      id: 1,
      value: 'ADMIN',
    });

    const result = await service.createRole({
      value: 'ADMIN',
      description: '',
    });

    expect(result.value).toBe('ADMIN');
  });

  it('should throw if role exists', async () => {
    jest.spyOn(service, 'existsRole').mockResolvedValue(true);

    await expect(
      service.createRole({
        value: 'ADMIN',
        description: '',
      }),
    ).rejects.toThrow(HttpException);
  });

  // ---------------- UPDATE ----------------

  it('should update role', async () => {
    jest.spyOn(service, 'existsRole').mockResolvedValue(false);

    mockPrisma.role.update.mockResolvedValue({
      id: 1,
      value: 'USER',
    });

    const result = await service.updateRole({ value: 'USER' }, 1);

    expect(result.value).toBe('USER');
  });

  // ---------------- DELETE ----------------

  it('should delete role', async () => {
    mockPrisma.role.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.role.delete.mockResolvedValue({ id: 1 });

    await service.destroy(1);

    expect(prisma.role.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should throw when deleting missing role', async () => {
    mockPrisma.role.findUnique.mockResolvedValue(null);

    await expect(service.destroy(1)).rejects.toThrow(HttpException);
  });
});
