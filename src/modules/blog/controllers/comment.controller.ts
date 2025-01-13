import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from '../dto/blog.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swaggerConsumes.enum';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dto/comment.dto';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';

@Controller('comment')
@ApiTags("Comment")
@AuthDecorator()
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @Post("/")
  @ApiConsumes(SwaggerConsumes.Urlencoded, SwaggerConsumes.Json)
  create(@Body() commentDto: CreateCommentDto) {
    return this.commentService.createComment(commentDto)
  }

  @Get("/")
  @Pagination()
  commentList(@Query() paginationDto: PaginationDto) {
    return this.commentService.commentList(paginationDto)
  }
  @Put("/accept/:id")
  acceptComment(@Param("id",ParseIntPipe) id: number) {
    return this.commentService.acceptComment(id)
  }
  @Put("/reject/:id")
  rejectComment(@Param("id",ParseIntPipe) id: number) {
    return this.commentService.rejectComment(id)
  }
}
