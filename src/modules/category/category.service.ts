import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { ConflictMessage, PublicMessage } from 'src/common/enums/message.enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.util';
import { NotFoundError } from 'rxjs';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity) private categoryRepository: Repository<CategoryEntity>
  ) { }
  async create(createCategoryDto: CreateCategoryDto) {
    let { title, priority } = createCategoryDto;
    title = await this.checkExistTitle(title);
    const cat = this.categoryRepository.create({ title, priority });
    await this.categoryRepository.save(cat)
    return {
      message: PublicMessage.Created
    };
  }
  async insertByTitle(title: string) {
    const cat = this.categoryRepository.create({ title });
    return await this.categoryRepository.save(cat)
  }

  async checkExistTitle(title: string) {
    title = title?.trim()?.toLocaleLowerCase();
    const cat = await this.categoryRepository.findOneBy({ title });
    if (cat)
      throw new ConflictException(ConflictMessage.CategoryTitle)
    return title;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, skip } = paginationSolver(paginationDto)
    const [categories, count] = await this.categoryRepository.findAndCount({
      where: {},
      skip,
      take: limit
    })
    return {
      pagination: paginationGenerator(count, page, limit),
      data: categories
    }
  }

  async findOne(id: number) {
    return await this.checkExistCategoryById(id);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.checkExistCategoryById(id);
    await this.categoryRepository.update({ id }, updateCategoryDto)
    return {
      message: PublicMessage.Updated
    };
  }

  async remove(id: number) {
    await this.checkExistCategoryById(id);
    await this.categoryRepository.delete({ id });
    return {
      message: PublicMessage.Deleted
    }
  }

  async checkExistCategoryById(id: number) {
    const cat = await this.categoryRepository.findOneBy({ id });
    if (!cat)
      throw new NotFoundException(PublicMessage.NotFound);
    return cat
  }
  async findOneByTitle(title: string) {
    return await this.categoryRepository.findOneBy({ title });
  }
}
