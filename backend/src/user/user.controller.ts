import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('add-user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('get-user')
  findAll() {
    return this.userService.findAll();
  }

  @Get('get-user/:id')
  findOne(@Param('id') id: string) {
    const userId = Number(id);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.userService.findOne(userId);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const userId = Number(id);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.userService.update(userId, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const userId = Number(id);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.userService.remove(userId);
  }
}
