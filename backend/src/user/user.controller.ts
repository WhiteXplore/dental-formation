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
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /* ================= CREATE USER ================= */
  @Post('add-user')
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/signatures'),
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (body.schedules) {
      body.schedules = JSON.parse(body.schedules);
    }

    if (file) {
      body.signature = file.filename;
    }

    return this.userService.create(body);
  }

  /* ================= UPDATE USER ================= */
  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/signatures'),
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (body.schedules) {
      body.schedules = JSON.parse(body.schedules);
    }

    if (file) {
      body.signature = file.filename;
    }

    return this.userService.update(id, body);
  }

  /* ================= GET ALL USERS ================= */
  @Get('get-user')
  findAll() {
    return this.userService.findAll();
  }

  /* ================= GET ONE USER ================= */
  @Get('get-user/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  /* ================= DELETE USER ================= */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
