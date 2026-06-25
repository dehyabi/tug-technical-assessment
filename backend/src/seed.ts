import { AppDataSource } from './config/data-source';
import { WellnessPackage, PackageStatus } from './modules/packages/entities/wellness-package.entity';

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(WellnessPackage);

  const packages = [
    {
      name: 'Swedish Massage',
      description: '60-minute full body relaxation massage with essential oils',
      price: 85.00,
      duration_minutes: 60,
      category: 'massage',
      status: PackageStatus.ACTIVE,
    },
    {
      name: 'Deep Tissue Massage',
      description: 'Intensive massage targeting deep muscle layers',
      price: 110.00,
      duration_minutes: 90,
      category: 'massage',
      status: PackageStatus.ACTIVE,
    },
    {
      name: 'Hydrating Facial',
      description: 'Rejuvenating facial treatment with hyaluronic acid',
      price: 95.00,
      duration_minutes: 75,
      category: 'facial',
      status: PackageStatus.ACTIVE,
    },
    {
      name: 'Anti-Aging Facial',
      description: 'Advanced treatment reducing fine lines and wrinkles',
      price: 140.00,
      duration_minutes: 90,
      category: 'facial',
      status: PackageStatus.INACTIVE,
    },
    {
      name: 'Yoga Session',
      description: 'Private yoga session with certified instructor',
      price: 65.00,
      duration_minutes: 60,
      category: 'fitness',
      status: PackageStatus.ACTIVE,
    },
  ];

  for (const pkg of packages) {
    const entity = repo.create(pkg);
    await repo.save(entity);
  }

  console.log('Seeded 5 packages');
  await AppDataSource.destroy();
}

seed().catch(console.error);
