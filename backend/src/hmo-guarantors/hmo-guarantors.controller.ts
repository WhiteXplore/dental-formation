import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HmoGuarantorsService } from './hmo-guarantors.service';
import { CreateHmoGuarantorDto } from './dto/create-hmo-guarantor.dto';
import { UpdateHmoGuarantorDto } from './dto/update-hmo-guarantor.dto';

@Controller('hmo-guarantors')
export class HmoGuarantorsController {
  constructor(private readonly hmoGuarantorsService: HmoGuarantorsService) {}

  @Post()
  create(@Body() createHmoGuarantorDto: CreateHmoGuarantorDto) {
    return this.hmoGuarantorsService.create(createHmoGuarantorDto);
  }

  @Get('get-hmo-guarantors')
  findAll() {
    return this.hmoGuarantorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hmoGuarantorsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHmoGuarantorDto: UpdateHmoGuarantorDto,
  ) {
    return this.hmoGuarantorsService.update(+id, updateHmoGuarantorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hmoGuarantorsService.remove(+id);
  }
}
