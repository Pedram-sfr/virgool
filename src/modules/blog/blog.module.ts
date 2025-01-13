import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BlogService } from './services/blog.service';
import { BlogController } from './controllers/blog.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { CategoryService } from '../category/category.service';
import { CategoryEntity } from '../category/entities/category.entity';
import { BlogCategoryentity } from './entities/blog-category.entity';
import { BlogLikesEntity } from './entities/blogLike.entity';
import { BlogBookmarksEntity } from './entities/blogBookmark.entity';
import { BlogCommentsEntity } from './entities/blogComment.entity';
import { CommentService } from './services/comment.service';
import { CommentController } from './controllers/comment.controller';
import { AddUserToReqWOV } from 'src/common/middleware/addUserToReqWOV,middleware';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([
    BlogEntity,
    CategoryEntity,
    BlogCategoryentity,
    BlogLikesEntity,
    BlogBookmarksEntity,
    BlogCommentsEntity
  ])],
  controllers: [BlogController,CommentController],
  providers: [BlogService, CategoryService,CommentService],
})
export class BlogModule implements NestModule { 
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(AddUserToReqWOV).forRoutes("blog/slug/:slug")
  }
}
