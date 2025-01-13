import { BaseEntity } from "src/common/abstrcats/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, UpdateDateColumn } from "typeorm";
import { OtpEntity } from "./otp.entity";
import { ProfileEntity } from "./profile.entity";
import { BlogEntity } from "src/modules/blog/entities/blog.entity";
import { BlogLikesEntity } from "src/modules/blog/entities/blogLike.entity";
import { BlogBookmarksEntity } from "src/modules/blog/entities/blogBookmark.entity";
import { BlogCommentsEntity } from "src/modules/blog/entities/blogComment.entity";
import { ImageEntity } from "src/modules/image/entities/image.entity";
import { Roles } from "src/common/enums/role.snum";
import { FollowEntity } from "./follow.entity";

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
    @Column({ unique: true })
    username: string;
    @Column({ unique: true, nullable: true })
    phone: string;
    @Column({ unique: true, nullable: true })
    email: string;
    @Column({ nullable: true })
    new_email: string;
    @Column({ nullable: true })
    new_phone: string;
    @Column({ default: Roles.User })
    role: string;
    @Column({ nullable: true , default: null})
    status: string;
    @Column({ default: false, nullable: true })
    verify_email: boolean;
    @Column({ default: false, nullable: true })
    verify_phone: boolean;
    @Column({ nullable: true })
    password: string
    @Column({ nullable: true })
    otpId: number
    @OneToOne(() => OtpEntity, otp => otp.user, { nullable: true })
    @JoinColumn()
    otp: OtpEntity
    @Column({ nullable: true })
    profileId: number
    @OneToOne(() => ProfileEntity, profile => profile.user, { nullable: true })
    @JoinColumn()
    profile: ProfileEntity
    @OneToMany(() => BlogEntity, blog => blog.author)
    blogs: BlogEntity[]
    @OneToMany(() => ImageEntity, Image => Image.user)
    images: ImageEntity[]
    @OneToMany(() => BlogLikesEntity, like => like.user)
    blog_likes: BlogLikesEntity[]
    @OneToMany(() => BlogBookmarksEntity, bookmark => bookmark.user)
    blog_bookmarks: BlogBookmarksEntity[]
    @OneToMany(() => BlogCommentsEntity, comment => comment.user)
    blog_comments: BlogCommentsEntity[]
    @OneToMany(() => FollowEntity, follow => follow.follower)
    following: FollowEntity[]
    @OneToMany(() => FollowEntity, follow => follow.following)
    followers: FollowEntity[]
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}
