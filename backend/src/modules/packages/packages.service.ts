import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WellnessPackage, PackageStatus } from './entities/wellness-package.entity';
import { CreatePackageDto } from './dto/create-package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(WellnessPackage)
    private readonly packageRepository: Repository<WellnessPackage>,
  ) {}

  async create(dto: CreatePackageDto): Promise<WellnessPackage> {
    const pkg = this.packageRepository.create(dto);
    return this.packageRepository.save(pkg) as any;
  }

  async findAll(): Promise<WellnessPackage[]> {
    return this.packageRepository.find({ order: { created_at: 'DESC' } as any });
  }

  async findOne(id: string): Promise<WellnessPackage> {
    const pkg = await this.packageRepository.findOne({ where: { id } as any });
    if (!pkg) {
      throw new NotFoundException(`Package with id ${id} not found`);
    }
    return pkg;
  }

  async update(id: string, dto: Partial<CreatePackageDto>): Promise<WellnessPackage> {
    const pkg = await this.findOne(id);
    Object.assign(pkg, dto);
    return this.packageRepository.save(pkg) as any;
  }

  async remove(id: string): Promise<void> {
    const pkg = await this.findOne(id);
    await this.packageRepository.remove(pkg);
  }

  async findActive(): Promise<Partial<WellnessPackage>[]> {
    return this.packageRepository.find({
      where: { status: PackageStatus.ACTIVE } as any,
      select: ['id', 'name', 'price', 'duration_minutes', 'category'] as any,
      order: { created_at: 'DESC' } as any,
    });
  }
}
