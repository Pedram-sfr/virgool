import { BaseEntity } from "src/common/abstrcats/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, ManyToOne } from "typeorm";
import { BlogEntity } from "./blog.entity";
import { CategoryEntity } from "src/modules/category/entities/category.entity";

@Entity(EntityName.BlogCategory)
export class BlogCategoryentity extends BaseEntity {
    @Column()
    blogId: number;
    @Column()
    categoryId: number;
    @ManyToOne(() => BlogEntity, blog => blog.categories, { onDelete: "CASCADE" })
    blog: BlogEntity
    @ManyToOne(() => CategoryEntity, category => category.blog_categories, { onDelete: "CASCADE" })
    category: CategoryEntity
}