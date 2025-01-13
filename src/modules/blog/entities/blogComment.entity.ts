import { BaseEntity } from "src/common/abstrcats/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BlogEntity } from "./blog.entity";

@Entity(EntityName.BlogComments)
export class BlogCommentsEntity extends BaseEntity{
    @Column()
    text: string;
    @Column({default: false})
    accepted: boolean;
    @Column()
    blogId: number;
    @Column()
    userId: number;
    @Column({nullable: true})
    parentId: number;
    @ManyToOne(()=>UserEntity,user=>user.blog_comments,{onDelete: "CASCADE"})
    user: UserEntity;
    @ManyToOne(()=>BlogEntity,blog=>blog.comments,{onDelete: "CASCADE"})
    blog: BlogEntity;
    @ManyToOne(()=>BlogCommentsEntity,parent=>parent.children,{onDelete: "CASCADE"})
    parent: BlogCommentsEntity;
    @OneToMany(()=>BlogCommentsEntity,commet=>commet.parent)
    @JoinColumn({name:"parent"})
    children: BlogCommentsEntity[];
    @CreateDateColumn()
    created_at: Date;
}