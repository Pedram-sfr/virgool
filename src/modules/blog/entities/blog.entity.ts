import { BaseEntity } from "src/common/abstrcats/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, Like, ManyToOne, OneToMany, UpdateDateColumn } from "typeorm";
import { BlogStatus } from "../enums/status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { BlogLikesEntity } from "./blogLike.entity";
import { BlogBookmarksEntity } from "./blogBookmark.entity";
import { BlogCommentsEntity } from "./blogComment.entity";
import { BlogCategoryentity } from "./blog-category.entity";

@Entity(EntityName.Blog)
export class BlogEntity extends BaseEntity {
    @Column()
    title: string;
    @Column({unique: true})
    slug: string;
    @Column()
    description: string;
    @Column()
    content: string;
    @Column({nullable: true})
    image: string;
    @Column({ default: BlogStatus.Draft })
    status: string;
    @Column()
    time_for_study: string;
    @Column()
    authorId: number;
    @ManyToOne(() => UserEntity, user => user.blogs, { onDelete: "CASCADE" })
    author: UserEntity;
    @OneToMany(() => BlogLikesEntity, like => like.blog)
    likes: BlogLikesEntity[]
    @OneToMany(() => BlogBookmarksEntity, bookmark => bookmark.blog)
    bookmarks: BlogBookmarksEntity[]
    @OneToMany(() => BlogCommentsEntity, comment => comment.blog)
    comments: BlogCommentsEntity[]
    @OneToMany(() => BlogCategoryentity, category => category.blog)
    categories: BlogCategoryentity[]
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date
}