import { IsString, IsNumber, IsEnum, IsOptional, Min, Max, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PackageStatus } from '../entities/wellness-package.entity';

export class CreatePackageDto {
  @ApiProperty({ example: 'Swedish Massage' })
  @IsString()
  @Length(3, 255)
  name: string;

  @ApiProperty({ example: '60-minute full body relaxation massage' })
  @IsString()
  description: string;

  @ApiProperty({ example: 85.0 })
  @IsNumber()
  @Min(0)
  @Max(99999.99)
  price: number;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @Min(1)
  @Max(480)
  duration_minutes: number;

  @ApiProperty({ example: 'massage' })
  @IsString()
  category: string;

  @ApiProperty({ enum: PackageStatus, default: PackageStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PackageStatus)
  status?: PackageStatus;
}
