import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { BlogEntity } from '../entities/blog.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from '../dto/blog.dto';
import { createSlug, randomString } from 'src/common/utils/functions.util';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BlogStatus } from '../enums/status.enum';
import { BadRequestMessage, PublicMessage } from 'src/common/enums/message.enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.util';
import { isArray } from 'class-validator';
import { CategoryService } from '../../category/category.service';
import { BlogCategoryentity } from '../entities/blog-category.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { BlogLikesEntity } from '../entities/blogLike.entity';
import { BlogBookmarksEntity } from '../entities/blogBookmark.entity';
import { BlogCommentsEntity } from '../entities/blogComment.entity';
import { CommentService } from './comment.service';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
    constructor(
        @InjectRepository(BlogEntity) private blogRepository: Repository<BlogEntity>,
        @InjectRepository(BlogCategoryentity) private blogCategoryRepository: Repository<BlogCategoryentity>,
        @InjectRepository(BlogLikesEntity) private blogLikesRepository: Repository<BlogLikesEntity>,
        @InjectRepository(BlogBookmarksEntity) private blogBookmarksRepository: Repository<BlogBookmarksEntity>,
        @Inject(REQUEST) private request: Request,
        private categoryService: CategoryService,
        private dataSource: DataSource,
        @Inject(forwardRef(() => CommentService)) private commentService: CommentService,
    ) { }

    async create(blogDto: CreateBlogDto) {
        const user = this.request.user
        let { slug, title, content, description, image, time_for_study, categories } = blogDto;
        if (!isArray(categories) && typeof categories === "string") {
            categories = categories.split(",")
        } else if (!isArray(categories))
            throw new BadRequestException(BadRequestMessage.InvalidCategory)

        slug = createSlug(slug ?? title)
        slug += `-${randomString()}`
        let blog = this.blogRepository.create({
            slug,
            title,
            content,
            description,
            image,
            time_for_study,
            status: BlogStatus.Draft,
            authorId: user.id
        })
        blog = await this.blogRepository.save(blog);
        for (const categorytitle of categories) {
            let category = await this.categoryService.findOneByTitle(categorytitle)
            if (!category) {
                category = await this.categoryService.insertByTitle(categorytitle)
            }
            await this.blogCategoryRepository.insert({
                blogId: blog.id,
                categoryId: category.id
            })
        }
        return {
            message: PublicMessage.Created
        }
    }

    async myBlog() {
        const { id } = this.request.user
        return await this.blogRepository.find({
            where: {
                authorId: id
            },
            order: {
                id: "DESC"
            }
        })
    }
    async blogList(paginationDto: PaginationDto, filterDto: FilterBlogDto) {
        const { limit, page, skip } = paginationSolver(paginationDto)
        let { tag, search } = filterDto
        let where = ''
        if (tag) {
            tag = tag.toLowerCase();
            if (where.length > 0)
                where += ' AND ';
            where += 'category.title = LOWER(:tag)'
        }
        if (search) {
            if (where.length > 0)
                where += ' AND ';
            search = `%${search}%`
            where += 'CONCAT(blog.title,blog.description,blog.content) ILIKE :search'
        }
        const [blogs, count] = await this.blogRepository.createQueryBuilder(EntityName.Blog)
            .leftJoin("blog.categories", "categories")
            .leftJoin("categories.category", "category")
            .leftJoin("blog.author", "author")
            .leftJoin("author.profile", "profile")
            .addSelect(["categories.id", "category.title", "author.id", "profile.nick_name", "author.username"])
            .where(where, { tag, search })
            .loadRelationCountAndMap("blog.likes", "blog.likes")
            .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
            .loadRelationCountAndMap("blog.comments", "blog.comments", "comments", (qb) =>
                qb.where("comments.accepted = :accepted", { accepted: true })
            )
            .orderBy("blog.id", "DESC")
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        // const [blogs, count] = await this.blogRepository.findAndCount({
        //     relations: {
        //         categories: {
        //             category: true,
        //         }
        //     },
        //     where,
        //     select: {
        //         categories: {
        //             id: true,
        //             category: {
        //                 title: true
        //             }
        //         }
        //     },
        //     order: {
        //         id: "DESC"
        //     },
        //     skip,
        //     take: limit
        // })
        return {
            pagination: paginationGenerator(count, page, limit),
            data: blogs
        }
    }

    async delete(id: number) {
        await this.checkExistBlogById(id);
        await this.blogRepository.delete({ id });
        return {
            message: PublicMessage.Deleted
        }
    }

    async update(id: number, blogDto: UpdateBlogDto) {
        const user = this.request.user
        let { slug, title, categories } = blogDto;
        let blog = await this.checkExistBlogById(id);
        if (!isArray(categories) && typeof categories === "string") {
            categories = categories.split(",")
        } else if (!isArray(categories))
            throw new BadRequestException(BadRequestMessage.InvalidCategory)

        slug = createSlug(slug ?? title)
        slug += `-${randomString()}`
        await this.blogRepository.update({ id }, {})
        for (const categorytitle of categories) {
            let category = await this.categoryService.findOneByTitle(categorytitle)
            if (!category) {
                category = await this.categoryService.insertByTitle(categorytitle)
            }
            await this.blogCategoryRepository.insert({
                blogId: blog.id,
                categoryId: category.id
            })
        }
        return {
            message: PublicMessage.Created
        }
    }

    async likeToggle(blogId: number) {
        const { id: userId } = this.request.user;
        const blog = await this.checkExistBlogById(blogId);
        const isLiked = await this.blogLikesRepository.findOneBy({ userId, blogId });
        if (isLiked)
            await this.blogLikesRepository.delete({ id: isLiked.id });
        else
            await this.blogLikesRepository.insert({ blogId, userId });
        return {
            message: PublicMessage.Done
        }

    }
    async bookmarkToggle(blogId: number) {
        const { id: userId } = this.request.user;
        await this.checkExistBlogById(blogId);
        const isBookmarked = await this.blogBookmarksRepository.findOneBy({ userId, blogId });
        if (isBookmarked)
            await this.blogBookmarksRepository.delete({ id: isBookmarked.id });
        else
            await this.blogBookmarksRepository.insert({ blogId, userId });
        return {
            message: PublicMessage.Done
        }
    }

    async checkExistBlogById(id: number) {
        const blog = await this.blogRepository.findOneBy({ id })
        if (!blog)
            throw new NotFoundException(PublicMessage.NotFound)
        return blog
    }

    async findOneBySlug(slug: string, paginationDto: PaginationDto) {
        const userId = this.request?.user?.id
        const blog = await this.blogRepository.createQueryBuilder(EntityName.Blog)
            .leftJoin("blog.categories", "categories")
            .leftJoin("categories.category", "category")
            .leftJoin("blog.author", "author")
            .leftJoin("author.profile", "profile")
            .addSelect(["categories.id", "category.title", "author.id", "profile.nick_name", "author.username"])
            .where({ slug })
            .loadRelationCountAndMap("blog.likes", "blog.likes")
            .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
            .getOne();

        if (!blog)
            throw new NotFoundException(PublicMessage.NotFound);
        const commentData = await this.commentService.findCommentByBlogId(blog.id, paginationDto)
        let isLiked: boolean = false,isBookmarked: boolean = false
        if (userId && !isNaN(userId) && userId > 0) {
            isBookmarked = !!(await this.blogBookmarksRepository.findOneBy({ userId, blogId: blog.id }));
            isLiked = !!(await this.blogLikesRepository.findOneBy({ userId, blogId: blog.id }));
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        const suggestBlog = await queryRunner.query(`
            WITH suggested_blogs AS (
                SELECT
                    blog.id,
                    blog.slug,
                    blog.title,
                    blog.description,
                    blog.time_for_study,
                    blog.image,
                    json_build_object(
                        'username', u.username,
                        'author_name', p.nick_name,
                        'image',p.image_profile
                    ) AS author,
                     array_agg(DISTINCT cat.title) AS categories,
                    (
                        SELECT COUNT(*) FROM blog_likes
                        WHERE blog_likes."blogId" = blog.id
                    ) AS likes,
                    (
                        SELECT COUNT(*) FROM blog_bookmarks
                        WHERE blog_bookmarks."blogId" = blog.id
                    ) AS bookmarks,
                    (
                        SELECT COUNT(*) FROM blog_comments
                        WHERE blog_comments."blogId" = blog.id
                    ) AS comments
                FROM blog
                LEFT JOIN public.user u ON blog."authorId" = u.id
                LEFT JOIN profile p ON p."userId" = u.id
                LEFT JOIN blog_category bc ON blog.id = bc."blogId"
                LEFT JOIN category cat ON bc."categoryId" = cat.id
                GROUP BY blog.id,u.username,p.nick_name,p.image_profile
                ORDER BY RANDOM()
                LIMIT 3

            )
            SELECT * FROM suggested_blogs
            `)
        return {
            blog,
            isLiked,
            isBookmarked,
            commentData,
            suggestBlog
        };
    }
}
