import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageDto } from './dto/image.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { Uploadfile } from 'src/common/interceptor/upload.interceptor';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { multerType } from 'src/common/utils/multer.util';
import { SwaggerConsumes } from 'src/common/enums/swaggerConsumes.enum';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.snum';

@Controller('image')
@ApiTags('image')
@AuthDecorator()
export class ImageController {
  constructor(private readonly imageService: ImageService) { }

  @Post()
  @UseInterceptors(Uploadfile('image', 'images'))
  @ApiConsumes(SwaggerConsumes.MultipartData)
  create(@Body() imageDto: ImageDto, @UploadedFile() image: multerType) {
    return this.imageService.create(imageDto, image);
  }

  @Get()
  findAll() {
    return this.imageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imageService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imageService.remove(+id);
  }
}
