import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ImageDto } from './dto/image.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from './entities/image.entity';
import { Repository } from 'typeorm';
import { multerType } from 'src/common/utils/multer.util';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PublicMessage } from 'src/common/enums/message.enum';

@Injectable({ scope: Scope.REQUEST })
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity) private imageRepository: Repository<ImageEntity>,
    @Inject(REQUEST) private req: Request
  ) { }
  async create(imageDto: ImageDto, image: multerType) {
    const { id: userId } = this.req.user
    let location = image.path.replaceAll("\\", "/").slice(7);
    const { name, alt } = imageDto;
    await this.imageRepository.insert({
      name, alt: alt || name, location, userId
    })
    return {
      message: PublicMessage.Created
    }
  }

  async findAll() {
    const { id: userId } = this.req.user
    return await  this.imageRepository.find({
      where: {
        userId
      },
      order: {
        id: "DESC"
      },
      select:{
        id: true,
        name: true,
        alt: true,
        location: true
      }
    })
  }

  async findOne(id: number) {
    const { id: userId } = this.req.user
    const image = await  this.imageRepository.findOne({
      where: {
        userId,id
      },
      order: {
        id: "DESC"
      },
      select:{
        id: true,
        name: true,
        alt: true,
        location: true
      }
    });
    if(!image)
      throw new NotFoundException(PublicMessage.NotFound)
    return image
  }

  async remove(id: number) {
    const image= await this.findOne(id);
    await this.imageRepository.remove(image)
    return {
      message: PublicMessage.Deleted
    }
  }
}
