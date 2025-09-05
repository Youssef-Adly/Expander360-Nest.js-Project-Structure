import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { UsersModule } from '../users/users.module';
import { Match } from './entities/match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    UsersModule
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule { }
