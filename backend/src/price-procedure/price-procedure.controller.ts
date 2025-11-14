import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PriceProcedureService } from './price-procedure.service';
import { CreatePriceProcedureDto } from './dto/create-price-procedure.dto';
import { UpdatePriceProcedureDto } from './dto/update-price-procedure.dto';

@Controller('price-procedure')
export class PriceProcedureController {
  constructor(private readonly priceProcedureService: PriceProcedureService) {}

  @Post('add-price-procedure')
  async create(@Body() createDto: CreatePriceProcedureDto) {
    return this.priceProcedureService.create(createDto);
  }

  @Get('get-price-procedure')
  async findAll() {
    return this.priceProcedureService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.priceProcedureService.findOne(id);
  }

  @Patch('update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePriceProcedureDto,
  ) {
    return this.priceProcedureService.update(id, updateDto);
  }

  @Delete('delete/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.priceProcedureService.remove(id);
    return { message: `Procedure #${id} successfully deleted.` };
  }
}
