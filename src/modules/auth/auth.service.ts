import { BadRequestException, ConflictException, Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthType } from './enums/type.enum';
import { AuthMethod } from './enums/method.enum';
import { isEmail, isMobilePhone } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Code, Repository } from 'typeorm';
import { ProfileEntity } from '../user/entities/profile.entity';
import { AuthMessage, BadRequestMessage, PublicMessage } from 'src/common/enums/message.enum';
import { OtpEntity } from '../user/entities/otp.entity';
import { randomInt, sign } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './tokens.service';
import { Request, Response } from 'express';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { AuthResponseType } from './types/response.type';
import { REQUEST } from '@nestjs/core';
import { CookieOptionsToken } from 'src/common/utils/cookie.util';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
        @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
        @Inject(REQUEST) private request: Request,
        private tokenService: TokenService
    ) { }
    async userExistence(authDto: AuthDto, res: Response) {
        const { method, type, username } = authDto
        let result: AuthResponseType;
        switch (type) {
            case AuthType.Login:
                result = await this.login(method, username);
                return this.sendRespose(res, result);
            case AuthType.Register:
                result = await this.register(method, username);
                return this.sendRespose(res, result);

                break;

            default:
                throw new UnauthorizedException();
        }
    }
    async login(method: AuthMethod, username: string) {
        const validUsername = this.usernameValidator(method, username)
        let user: UserEntity = await this.checkExistUser(method, validUsername);
        if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount)
        const otp = await this.sendAndSaveOTP(user.id,method);
        const token = this.tokenService.signOtpTOken({ userId: user.id })
        return {
            token,
            code: otp.code
        }
    }
    async register(method: AuthMethod, username: string) {
        const validUsername = this.usernameValidator(method, username)
        let user: UserEntity = await this.checkExistUser(method, validUsername);
        const usernameGen = `m_${Math.floor(new Date().valueOf() * randomInt(1000, 9999)).toString().split("").slice(8).toString().replaceAll(",", "")}`
        if (user) throw new ConflictException(AuthMessage.AlreadyExistAccount)
        if (method === AuthMethod.Username) throw new BadRequestException(BadRequestMessage.InValidRegisterDto)
        user = this.userRepository.create({
            [method]: username,
            username: usernameGen
        });
        user = await this.userRepository.save(user)
        const otp = await this.sendAndSaveOTP(user.id,method)
        const token = this.tokenService.signOtpTOken({ userId: user.id })
        return {
            token,
            code: otp.code
        }
    }

    async sendRespose(res: Response, result: AuthResponseType) {
        const { token, code } = result
        res.cookie(CookieKeys.OTP, token, CookieOptionsToken());
        res.json({
            message: PublicMessage.SendOtp,
            code
        })
    }

    async sendAndSaveOTP(userId: number, method: AuthMethod) {
        const code = randomInt(10000, 99999).toString();
        const expiresIn = new Date(Date.now() + (1000 * 60 * 2));
        let otp = await this.otpRepository.findOneBy({ userId })
        let existOtp = false;
        if (otp) {
            existOtp = true
            otp.code = code,
            otp.expiresIn = expiresIn,
            otp.method = method
        } else {
            otp = this.otpRepository.create({
                code, expiresIn, userId, method
            })
        }
        otp = await this.otpRepository.save(otp);
        if (!existOtp) {
            await this.userRepository.update({ id: userId }, {
                otpId: otp.id
            })
        }
        return otp
    }

    async checkOtp(code: string) {
        const token = this.request.cookies?.[CookieKeys.OTP];
        if (!token) throw new UnauthorizedException((AuthMessage.ExpiredCode));
        const { userId } = this.tokenService.verifyOtpToken(token);
        const otp = await this.otpRepository.findOneBy(
            { userId }
        );
        if (!otp) throw new UnauthorizedException(AuthMessage.TryAgain)
        if (otp.expiresIn < new Date())
            throw new UnauthorizedException(AuthMessage.ExpiredCode)
        if (otp.code !== code)
            throw new UnauthorizedException(AuthMessage.IncorrectCode)
        const signtoken = this.tokenService.signToken({ userId })
        if (otp.method === AuthMethod.Email) {
            await this.userRepository.update({ id: userId }, {
                verify_email: true
            })
        } else if (otp.method === AuthMethod.Phone) {
            await this.userRepository.update({ id: userId }, {
                verify_phone: true
            })
        }
        return {
            message: PublicMessage.LoggedIn,
            token: signtoken
        }
    }

    async checkExistUser(method: AuthMethod, username: string) {
        let user: UserEntity;
        switch (method) {
            case AuthMethod.Phone:
                user = await this.userRepository.findOneBy({ phone: username })

                break;
            case AuthMethod.Email:
                user = await this.userRepository.findOneBy({ email: username })

                break;
            case AuthMethod.Username:
                user = await this.userRepository.findOneBy({ username })
                break;
            default:
                throw new BadRequestException(BadRequestMessage.InValidLoginDto);
        }
        return user;
    }

    async validateAccessToken(token: string) {
        const { userId } = this.tokenService.verifyAccessToken(token)
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            },
            select: {
                username: true,
                phone: true,
                email: true,
                profileId: true,
                id: true,
                new_email: true,
                new_phone: true,
                role: true,
                status: true
            }
        })
        if (!user)
            throw new UnauthorizedException(AuthMessage.LoginAgain)
        return user;
    }
    usernameValidator(method: AuthMethod, username: string) {
        switch (method) {
            case AuthMethod.Email:
                if (isEmail(username)) return username;
                throw new BadRequestException("email format is incorect");
            case AuthMethod.Phone:
                if (isMobilePhone(username, "fa-IR")) return username;
                throw new BadRequestException("mobile format is incorect");
            case AuthMethod.Username:
                return username;

            default:
                throw new UnauthorizedException();
        }
    }
}
