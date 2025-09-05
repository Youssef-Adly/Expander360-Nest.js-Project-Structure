import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { UsersModule } from '../users/users.module';
import { Vendor } from './entities/vendor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor]),
    UsersModule
  ],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule { }
