import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from './packages.service';
import { WellnessPackage, PackageStatus } from './entities/wellness-package.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const mockPackage: WellnessPackage = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Swedish Massage',
  description: 'Relaxing massage',
  price: 85.00,
  duration_minutes: 60,
  category: 'massage',
  status: PackageStatus.ACTIVE,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('PackagesService', () => {
  let service: PackagesService;
  let repository: Repository<WellnessPackage>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        {
          provide: getRepositoryToken(WellnessPackage),
          useValue: {
            create: jest.fn().mockReturnValue(mockPackage),
            save: jest.fn().mockResolvedValue(mockPackage),
            find: jest.fn().mockResolvedValue([mockPackage]),
            findOne: jest.fn().mockResolvedValue(mockPackage),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
    repository = module.get<Repository<WellnessPackage>>(getRepositoryToken(WellnessPackage));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a package', async () => {
      const dto = {
        name: 'Swedish Massage',
        description: 'Relaxing massage',
        price: 85.00,
        duration_minutes: 60,
        category: 'massage',
      };
      const result = await service.create(dto as any);
      expect(result).toEqual(mockPackage);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(mockPackage);
    });
  });

  describe('findAll', () => {
    it('should return an array of packages', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockPackage]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single package', async () => {
      const result = await service.findOne(mockPackage.id);
      expect(result).toEqual(mockPackage);
    });

    it('should throw NotFoundException if package not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null as any);
      await expect(service.findOne('invalid-id')).rejects.toThrow('Package with id invalid-id not found');
    });
  });

  describe('findActive', () => {
    it('should return active packages with limited fields', async () => {
      const result = await service.findActive();
      expect(repository.find).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: PackageStatus.ACTIVE },
      }));
    });
  });
});
