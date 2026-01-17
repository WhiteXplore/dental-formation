import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User_Accounts } from './entities/user.entity';
import { DentistSchedule } from './entities/dentist.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User_Accounts, DentistSchedule])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
