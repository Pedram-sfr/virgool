import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthDto, CheckOtpDto } from './dto/auth.dto';
import { SwaggerConsumes } from 'src/common/enums/swaggerConsumes.enum';
import { Request, Response } from 'express';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { AuthGuard } from './guards/auth.guard';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.snum';

@Controller('auth')
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Post("user-existence")
  @ApiConsumes(SwaggerConsumes.Urlencoded, SwaggerConsumes.Json)
  userExistence(@Body() authDto: AuthDto, @Res() res: Response) {
    return this.authService.userExistence(authDto, res)
  }
  @Post("check-otp")
  @ApiConsumes(SwaggerConsumes.Urlencoded, SwaggerConsumes.Json)
  checkOtp(@Body() checkOtpDto: CheckOtpDto) {
    return this.authService.checkOtp(checkOtpDto.code)
  }
  @Get("check-login")
  @AuthDecorator()
  @CanAccess(Roles.Admin)

  checkLogin(@Req() req: Request) {
    return req.user;
  }
}
