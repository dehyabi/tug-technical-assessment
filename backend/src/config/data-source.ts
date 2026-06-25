import { DataSource } from 'typeorm';
import { WellnessPackage } from '../modules/packages/entities/wellness-package.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '3306'),
  username: process.env['DB_USER'] || 'wellness_user',
  password: process.env['DB_PASSWORD'] || 'wellness_pass',
  database: process.env['DB_NAME'] || 'wellness_db',
  entities: [WellnessPackage],
  synchronize: process.env['NODE_ENV'] !== 'production',
  logging: process.env['NODE_ENV'] === 'development',
});
