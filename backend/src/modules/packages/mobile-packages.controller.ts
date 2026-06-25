import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PackagesService } from './packages.service';

@ApiTags('mobile')
@Controller('mobile/packages')
export class MobilePackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  @ApiOperation({ summary: 'List active packages for mobile' })
  @ApiResponse({ status: 200, description: 'Returns active packages with limited fields' })
  async findActive(): Promise<Partial<{ id: string; name: string; price: number; duration_minutes: number; category: string }>[]> {
    return this.packagesService.findActive();
  }
}
