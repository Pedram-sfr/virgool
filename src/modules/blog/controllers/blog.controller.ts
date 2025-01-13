import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from '../dto/blog.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swaggerConsumes.enum';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { FilterBlog } from 'src/common/decorators/filter.decorator';
import { query } from 'express';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';

@Controller('blog')
@ApiTags("Blog")
@AuthDecorator()
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @Post("/")
  @ApiConsumes(SwaggerConsumes.Urlencoded, SwaggerConsumes.Json)
  create(@Body() blogDto: CreateBlogDto) {
    return this.blogService.create(blogDto)
  }
  @Get("/myBlog")
  myBlog() {
    return this.blogService.myBlog()
  }
  @Delete("/myBlo/:id")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.delete(id)
  }
  @Get("/")
  @SkipAuth()
  @Pagination()
  @FilterBlog()
  blogList(@Query() paginationDto: PaginationDto, @Query() filterDto: FilterBlogDto) {
    return this.blogService.blogList(paginationDto, filterDto)
  }

  @Get("/slug/:slug")
  @SkipAuth()
  @Pagination()
  findOneBySlug(@Param('slug') slug: string,@Query() paginationDto: PaginationDto,) {
    return this.blogService.findOneBySlug(slug,paginationDto)
  }

  @Put("/:id")
  @ApiConsumes(SwaggerConsumes.Urlencoded, SwaggerConsumes.Json)
  update(@Param("id", ParseIntPipe) id: number, @Body() blogDto: UpdateBlogDto) {
    return this.blogService.update(id, blogDto)
  }
  @Get("/like/:id")
  likeToggle(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.likeToggle(id)
  }
  @Get("/bookmark/:id")
  bookmarkToggle(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.bookmarkToggle(id)
  }
}
