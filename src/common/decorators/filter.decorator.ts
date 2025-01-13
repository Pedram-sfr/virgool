import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export function FilterBlog() {
    return applyDecorators(
        ApiQuery({ name: "tag", example: "" ,required: false}),
        ApiQuery({ name: "search", example: "" ,required: false}),
    )
}