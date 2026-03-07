import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('add-user')
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: './uploads/signatures',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (body.schedules) {
      body.schedules = JSON.parse(body.schedules);
    }

    if (file) {
      body.signature = file.filename; // save filename to DB
    }

    return this.userService.create(body);
  }

  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: './uploads/signatures',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const userId = Number(id);

    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    if (body.schedules) {
      body.schedules = JSON.parse(body.schedules);
    }

    if (file) {
      body.signature = file.filename;
    }

    return this.userService.update(userId, body);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    const userId = Number(id);

    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userService.remove(userId);
  }
}
