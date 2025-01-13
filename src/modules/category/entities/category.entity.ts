import { BaseEntity } from "src/common/abstrcats/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BlogCategoryentity } from "src/modules/blog/entities/blog-category.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity(EntityName.Category)
export class CategoryEntity extends BaseEntity {
    @Column()
    title: string;
    @Column({ nullable: true })
    priority: number;
    @OneToMany(()=>BlogCategoryentity,blog=>blog.category)
    blog_categories: BlogCategoryentity[]
}
