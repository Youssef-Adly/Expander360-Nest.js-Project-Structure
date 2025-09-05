import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { AuthGuard } from '../users/auth.guard';

@Controller('matches')
@UseGuards(AuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) { }

  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Get()
  findAll(
    @Query('project_id') projectId?: number,
    @Query('vendor_id') vendorId?: number,
    @Query('top') top?: number,
  ) {
    if (projectId) {
      return this.matchesService.findByProject(projectId);
    }
    if (vendorId) {
      return this.matchesService.findByVendor(vendorId);
    }
    if (top) {
      return this.matchesService.findTopMatches(top);
    }
    return this.matchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMatchDto: UpdateMatchDto) {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.remove(id);
  }
}
