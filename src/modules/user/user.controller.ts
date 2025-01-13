import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, UploadedFile, ParseFilePipe, UseGuards, UploadedFiles, Res, ParseIntPipe, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { ChangeEmailDto, ChangePhoneDto, ChangeUsernameDto, ProfileDto } from './dto/profile.dto';
import { SwaggerConsumes } from 'src/common/enums/swaggerConsumes.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { multerDestination, multerFilename, multerStorage } from 'src/common/utils/multer.util';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ProfileImageType } from './types/files.type';
import { UploadedOptionalFiles } from 'src/common/decorators/upload-file.decorator';
import { Response, response } from 'express';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { CookieOptionsToken } from 'src/common/utils/cookie.util';
import { PublicMessage } from 'src/common/enums/message.enum';
import { BlockDto, CheckOtpDto } from '../auth/dto/auth.dto';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.snum';

@Controller('user')
@ApiTags("User")
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) { }

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }

  @Put("/profile")
  @UseInterceptors(FileFieldsInterceptor([
    { name: "image_profile", maxCount: 1 },
    { name: "bg_image", maxCount: 1 }
  ], {
    storage: multerStorage("user-profile","profile")
  }))

  @ApiConsumes(SwaggerConsumes.MultipartData)
  changeProfile(
    @UploadedOptionalFiles() files: ProfileImageType,
    @Body() profileDto: ProfileDto) {
    return this.userService.changeProfile(files,profileDto);
  }

  @Get("/profile")
  profile(){
    return this.userService.profile()
  }

  @Get("/follow/:followingId")
  @ApiParam({name: "followingId"})
  follow(@Param("followingId",ParseIntPipe) followingId: number){
    return this.userService.follow(followingId)
  }
  @Get("/followers")
  @Pagination()
  followers(@Query() paginationDto: PaginationDto){
    return this.userService.followers(paginationDto)
  }

  @Get("/following")
  @Pagination()
  following(@Query() paginationDto: PaginationDto){
    return this.userService.following(paginationDto)
  }

  @Patch("/profile/change-email")
  @ApiConsumes(SwaggerConsumes.Urlencoded,SwaggerConsumes.Json)
  async changeEmail(@Body() emailDto: ChangeEmailDto, @Res() res: Response){
    const {code,token,message} = await this.userService.changeEmail(emailDto.email)
    if(message)
      return res.json({message})
    res.cookie(CookieKeys.EmailOTP,token,CookieOptionsToken())
    return res.json({
      message: PublicMessage.SendOtp,
      code
    })
  }
  @Post("/profile/verify-email")
  @ApiConsumes(SwaggerConsumes.Urlencoded,SwaggerConsumes.Json)
  async verifyEmail(@Body() otpDto: CheckOtpDto){
    return await this.userService.verifyEmail(otpDto.code)
  }
  @Patch("/profile/change-phone")
  @ApiConsumes(SwaggerConsumes.Urlencoded,SwaggerConsumes.Json)
  async changePhone(@Body() phoneDto: ChangePhoneDto, @Res() res: Response){
    const {code,token,message} = await this.userService.changePhone(phoneDto.phone)
    if(message)
      return res.json({message})
    res.cookie(CookieKeys.PhoneOTP,token,CookieOptionsToken())
    return res.json({
      message: PublicMessage.SendOtp,
      code
    })
  }
  @Post("/profile/verify-phone")
  @ApiConsumes(SwaggerConsumes.Urlencoded,SwaggerConsumes.Json)
  async verifyPhone(@Body() otpDto: CheckOtpDto){
    return await this.userService.verifyPhone(otpDto.code)
  }
  @Post("/blockUser")
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumes.Urlencoded,SwaggerConsumes.Json)
  async blockUser(@Body() blockDto: BlockDto){
    return await this.userService.blockUserToggle(blockDto)
  }
  @Patch("/profile/change-username")
  @ApiConsumes(SwaggerConsumes.Urlencoded,SwaggerConsumes.Json)
  async changeUsername(@Body() usernameDto: ChangeUsernameDto){
    return await this.userService.changeUsername(usernameDto)
  }
}
