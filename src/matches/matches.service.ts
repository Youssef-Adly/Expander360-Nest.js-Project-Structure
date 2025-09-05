import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>
  ) { }

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    const match = this.matchRepository.create(createMatchDto);
    return await this.matchRepository.save(match);
  }

  async findAll(): Promise<Match[]> {
    return await this.matchRepository.find({
      relations: ['project', 'vendor', 'project.user'],
      order: { score: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['project', 'vendor', 'project.user']
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return match;
  }

  async findByProject(projectId: number): Promise<Match[]> {
    return await this.matchRepository.find({
      where: { project_id: projectId },
      relations: ['vendor'],
      order: { score: 'DESC' }
    });
  }

  async findByVendor(vendorId: number): Promise<Match[]> {
    return await this.matchRepository.find({
      where: { vendor_id: vendorId },
      relations: ['project', 'project.user'],
      order: { score: 'DESC' }
    });
  }

  async findTopMatches(limit: number = 10): Promise<Match[]> {
    return await this.matchRepository.find({
      relations: ['project', 'vendor', 'project.user'],
      order: { score: 'DESC' },
      take: limit
    });
  }

  async update(id: number, updateMatchDto: UpdateMatchDto): Promise<Match> {
    const match = await this.findOne(id);
    Object.assign(match, updateMatchDto);
    return await this.matchRepository.save(match);
  }

  async remove(id: number): Promise<void> {
    const match = await this.findOne(id);
    await this.matchRepository.remove(match);
  }
}
