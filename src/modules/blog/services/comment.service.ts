import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { BlogEntity } from '../entities/blog.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BlogCommentsEntity } from '../entities/blogComment.entity';
import { BlogService } from './blog.service';
import { CreateCommentDto } from '../dto/comment.dto';
import { BadRequestMessage, PublicMessage } from 'src/common/enums/message.enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.util';
import { take } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class CommentService {
    constructor(
        @InjectRepository(BlogEntity) private blogRepository: Repository<BlogEntity>,
        @InjectRepository(BlogCommentsEntity) private blogCommentsRepository: Repository<BlogCommentsEntity>,
        @Inject(REQUEST) private request: Request,
        @Inject(forwardRef(() => BlogService)) private blogService: BlogService
    ) { }
    async createComment(commentDto: CreateCommentDto) {
        const { text, parentId, blogId } = commentDto;
        const { id: userId } = this.request.user
        await this.blogService.checkExistBlogById(blogId);
        let parent = null;
        if (parentId && !isNaN(parentId)) {
            parent = await this.blogCommentsRepository.findOneBy({ id: +parentId });
        }
        await this.blogCommentsRepository.insert({
            text,
            accepted: true,
            blogId,
            userId,
            parentId: parent ? parentId : null,
        })
        return {
            message: PublicMessage.Created
        }
    }

    async findCommentByBlogId(blogId: number, paginationDto: PaginationDto) {
        const { limit, page, skip } = paginationSolver(paginationDto)
        const [comments, count] = await this.blogCommentsRepository.findAndCount({
            where: {
                blogId,
                parentId: IsNull()
            },
            relations: {
                user: {
                    profile: true
                },
                children: {
                    user: {
                        profile: true
                    },
                    children: {
                        user: {
                            profile: true
                        }
                    }
                }
            },
            select: {
                user: {
                    username: true,
                    profile: {
                        nick_name: true
                    }
                },
                children: {
                    parentId: true,
                    text: true,
                    created_at: true,
                    user: {
                        username: true,
                        profile: {
                            nick_name: true
                        }
                    },
                    children: {
                        parentId: true,
                        text: true,
                        created_at: true,
                        user: {
                            username: true,
                            profile: {
                                nick_name: true
                            }
                        }
                    }
                }
            },
            skip,
            take: limit,
            order: {
                id: "DESC"
            }
        })
        return {
            pagination: paginationGenerator(count, page, limit),
            data: comments
        }
    }
    async commentList(paginationDto: PaginationDto) {
        const { limit, page, skip } = paginationSolver(paginationDto)
        const [comments, count] = await this.blogCommentsRepository.findAndCount({
            where: {},
            relations: {
                blog: true,
                user: {
                    profile: true
                }
            },
            select: {
                blog: {
                    title: true
                },
                user: {
                    username: true,
                    profile: {
                        nick_name: true
                    }
                }
            },
            skip,
            take: limit,
            order: {
                id: "DESC"
            }
        })
        return {
            pagination: paginationGenerator(count, page, limit),
            data: comments
        }
    }

    async acceptComment(id: number) {
        const comment = await this.checkExistCommentById(id);
        if (comment.accepted)
            throw new BadRequestException(BadRequestMessage.AlreadyAccepted);
        comment.accepted = true;
        await this.blogCommentsRepository.save(comment);
        return {
            message: PublicMessage.Updated
        }
    }
    async rejectComment(id: number) {
        const comment = await this.checkExistCommentById(id);
        if (!comment.accepted)
            throw new BadRequestException(BadRequestMessage.AlreadyRejected);
        comment.accepted = false;
        await this.blogCommentsRepository.save(comment);
        return {
            message: PublicMessage.Updated
        }
    }

    async checkExistCommentById(id: number) {
        const comment = await this.blogCommentsRepository.findOneBy({ id })
        if (!comment)
            throw new NotFoundException(PublicMessage.NotFound)
        return comment;
    }
}
