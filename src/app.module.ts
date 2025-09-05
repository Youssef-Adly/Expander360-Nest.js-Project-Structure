import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './MySQL/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { VendorsModule } from './vendors/vendors.module';
import { MatchesModule } from './matches/matches.module';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
// import { UsersService } from './users/users.service';
// import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from './users/roles.guard';
// import { AuthGuard } from './users/auth.guard';
import { ReportsModule } from './reports/reports.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    ProjectsModule,
    VendorsModule,
    MatchesModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '7d' },
      global: true
    }),
    MongooseModule.forRoot(`mongodb://localhost:27017/Expander360`),
    ReportsModule,
    AnalyticsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // UsersService,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule { }
