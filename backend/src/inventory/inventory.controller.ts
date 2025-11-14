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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Response } from 'express';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('add-inventory')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const imageBuffer = image?.buffer;
    return this.inventoryService.create(createInventoryDto, imageBuffer);
  }

  @Get('get-inventory')
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const imageBuffer = image?.buffer;
    return this.inventoryService.update(id, updateInventoryDto, imageBuffer);
  }

  @Delete('delete/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
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

    res.set({
      'Content-Type': 'image/jpeg', // You can dynamically detect MIME type
      'Content-Length': item.image.length,
    });

    return res.send(item.image);
  }
}
