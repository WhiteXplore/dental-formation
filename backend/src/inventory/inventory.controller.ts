import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Response } from 'express';
import { existsSync } from 'fs';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /* ================= CREATE ================= */
 /* ================= CREATE ================= */
  @Post('add-inventory')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: join(__dirname, '../../uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `inventory-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.inventoryService.create(createInventoryDto, image?.filename);
  }


  /* ================= READ ================= */
  @Get('get-inventory')
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Get('inventory-image/:id')
  async serveInventoryImage(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const item = await this.inventoryService.findOne(id);

    if (!item || !item.image) {
      return res.status(404).send('Image not found');
    }

    const imagePath = join(__dirname, '../../uploads', item.image);

    if (!existsSync(imagePath)) {
      return res.status(404).send('Image file not found on server');
    }

    return res.sendFile(imagePath);
  }

  /* ================= UPDATE ================= */
  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: join(__dirname, '../../uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `inventory-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.inventoryService.update(id, updateInventoryDto, image?.filename);
  }

  /* 🔔 MARK SINGLE INVENTORY NOTIFICATION AS VIEWED */
  @Patch(':id/notification')
  markNotificationViewed(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.markAsViewed(id);
  }

  /* 🔔 MARK ALL INVENTORY NOTIFICATIONS AS VIEWED */
  @Patch('notifications/mark-all-read')
  markAllNotificationsViewed() {
    return this.inventoryService.markAllAsViewed();
  }

  /* ================= DELETE ================= */
  @Delete('delete/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }

  /* ================= STOCK ================= */
  @Patch('deduct')
  deductInventory(@Body() body: { inventoryId: number; quantity: number }) {
    return this.inventoryService.deductInventory(
      body.inventoryId,
      body.quantity,
    );
  }
}
