import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, Length } from "class-validator";

export class CreateBlogDto {
    @ApiProperty({example: ""})
    @IsNotEmpty()
    @Length(10,150)
    title: string;
    @ApiPropertyOptional({example: ""})
    slug: string;
    @ApiProperty({example: ""})
    @IsNotEmpty()
    time_for_study: string;
    @ApiPropertyOptional({example: ""})
    image: string;
    @ApiProperty({example: ""})
    @IsNotEmpty()
    @Length(10,300)
    description: string;
    @ApiProperty({example: ""})
    @IsNotEmpty()
    @Length(100)
    content: string;
    @ApiProperty({type: "string", isArray: true})
    // @IsArray()
    categories: string[] | string

}

export class UpdateBlogDto extends PartialType(CreateBlogDto){}

export class FilterBlogDto {
    tag: string;
    search: string
}