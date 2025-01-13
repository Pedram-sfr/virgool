import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsMobilePhone, IsOptional, IsString, Length } from "class-validator";
import { Gender } from "../enums/gender.enum";
import { ValidationMessage } from "src/common/enums/message.enum";

export class ProfileDto {
    @ApiPropertyOptional({ nullable: true, example: "" })
    @IsOptional()
    @Length(3, 100)
    nick_name: string;
    @ApiPropertyOptional({ nullable: true, example: "" })
    @IsOptional()
    @Length(3, 200)
    bio: string;
    @ApiPropertyOptional({ nullable: true, format: "binary" })
    image_profile: string;
    @ApiPropertyOptional({ nullable: true, format: "binary" })
    bg_image: string;
    @ApiPropertyOptional({ nullable: true, enum: Gender, example: "" })
    @IsOptional()
    @IsEnum(Gender)
    gender: string;
    @ApiPropertyOptional({ nullable: true, example: "", description: "1999-01-05T00:00:00.000Z", format: "date-time" })
    birthday: Date;
    @ApiPropertyOptional({ nullable: true, example: "" })
    linkedin_profile: string;
}

export class ChangeEmailDto {
    @ApiProperty()
    @IsEmail({}, { message: ValidationMessage.InValidEmailFormat })
    email: string
}
export class ChangePhoneDto {
    @ApiProperty()
    @IsMobilePhone("fa-IR", {}, { message: ValidationMessage.InValidPhoneFormat })
    phone: string
}
export class ChangeUsernameDto {
    @ApiProperty()
    @IsString()
    @Length(3,100)
    username: string;
}