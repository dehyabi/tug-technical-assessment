import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { WellnessPackage } from './entities/wellness-package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@ApiTags('admin')
@Controller('admin/packages')
export class AdminPackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all packages' })
  @ApiResponse({ status: 200, type: [WellnessPackage] })
  async findAll(): Promise<WellnessPackage[]> {
    return this.packagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a package by ID' })
  @ApiResponse({ status: 200, type: WellnessPackage })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async findOne(@Param('id') id: string): Promise<WellnessPackage> {
    return this.packagesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new package' })
  @ApiResponse({ status: 201, type: WellnessPackage })
  async create(@Body() dto: CreatePackageDto): Promise<WellnessPackage> {
    return this.packagesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a package' })
  @ApiResponse({ status: 200, type: WellnessPackage })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePackageDto,
  ): Promise<WellnessPackage> {
    return this.packagesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a package' })
  @ApiResponse({ status: 204, description: 'Package deleted' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.packagesService.remove(id);
  }
}
