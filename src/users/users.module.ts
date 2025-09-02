import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/MySQL/database.module';
import { JwtModule } from '@nestjs/jwt';
import { userProviders } from './user.providers';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({ secret: 'secret', signOptions: { expiresIn: '7d' } }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    // ...userProviders,

  ],
})
export class UsersModule {}
