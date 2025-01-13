import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ImageDto {
    @ApiPropertyOptional({example: ""})
    alt: string;
    @ApiProperty({example: ""})
    name: string;
    @ApiProperty({format: "binary"})
    image: string;
}
