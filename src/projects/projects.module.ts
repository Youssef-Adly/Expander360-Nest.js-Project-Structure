import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { UsersModule } from '../users/users.module';
import { MatchesModule } from '../matches/matches.module';
import { Project } from './entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { ProjectOwnershipGuard } from '../users/ownership.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, User]),
    UsersModule,
    MatchesModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectOwnershipGuard],
  exports: [ProjectsService],
})
export class ProjectsModule { }

