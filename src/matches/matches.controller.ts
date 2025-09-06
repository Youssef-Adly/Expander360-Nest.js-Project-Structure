import {
  Controller,
  Param,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { QueryMatchDto } from './dto/query-match.dto';
import { AuthGuard } from '../users/auth.guard';
import { RolesGuard } from '../users/roles.guard';
import { UserRoles } from '../users/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('matches')
@UseGuards(AuthGuard, RolesGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) { }

  // Only admins can manually create matches
  @UserRoles(Role.Admin)
  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  // Both clients and admins can view matches
  @UserRoles(Role.Client, Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Get()
  findAll(@Query() queryMatchDto: QueryMatchDto) {
    if (queryMatchDto.project_id) {
      return this.matchesService.findByProject(queryMatchDto.project_id);
    }
    if (queryMatchDto.vendor_id) {
      return this.matchesService.findByVendor(queryMatchDto.vendor_id);
    }
    if (queryMatchDto.top) {
      return this.matchesService.findTopMatches(queryMatchDto.top);
    }
    return this.matchesService.findAll();
  }

  // Both clients and admins can view individual matches
  @UserRoles(Role.Client, Role.Admin)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.findOne(id);
  }

  // Only admins can update matches
  @UserRoles(Role.Admin)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMatchDto: UpdateMatchDto) {
    return this.matchesService.update(id, updateMatchDto);
  }

  // Only admins can delete matches
  @UserRoles(Role.Admin)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.remove(id);
  }
}
