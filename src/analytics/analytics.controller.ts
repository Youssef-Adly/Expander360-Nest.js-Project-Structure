import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../users/auth.guard';
import { RolesGuard } from '../users/roles.guard';
import { UserRoles } from '../users/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('analytics')
@UseGuards(AuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @UserRoles(Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Get('top-vendors')
  getTopVendorsPerCountry() {
    return this.analyticsService.getTopVendorsPerCountry();
  }

  @UserRoles(Role.Admin, Role.Client)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Get('vendor/:vendorId/performance')
  getVendorPerformanceMetrics(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.analyticsService.getVendorPerformanceMetrics(vendorId);
  }
}
