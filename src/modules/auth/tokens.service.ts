import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenPayloadType, EmailPayloadType, PayloadType, PhonePayloadType } from "./types/payload.type";
import { AuthMessage, BadRequestMessage } from "src/common/enums/message.enum";

@Injectable()
export class TokenService{
    constructor(
        private jwtService: JwtService
    ){};

    signOtpTOken(payload: PayloadType){
        const token =  this.jwtService.sign(payload,{
            secret: process.env.OTP_TOKEN_SECRET,
            expiresIn: 60*2
        })
        return token;
    }

    verifyOtpToken(token: string): PayloadType{
        try {
            return this.jwtService.verify(token,{
                secret: process.env.OTP_TOKEN_SECRET
            })
        } catch (error) {
            throw new UnauthorizedException(AuthMessage.TryAgain);
        }
    }

    signAccessTOken(payload: AccessTokenPayloadType){
        const token =  this.jwtService.sign(payload,{
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: "30d"
        })
        return token;
    }

    verifyAccessToken(token: string): AccessTokenPayloadType{
        try {
            return this.jwtService.verify(token,{
                secret: process.env.ACCESS_TOKEN_SECRET
            })
        } catch (error) {
            throw new UnauthorizedException(AuthMessage.LoginAgain);
        }
    }

    signRefreshTOken(payload: AccessTokenPayloadType){
        const token =  this.jwtService.sign(payload,{
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: "1y"
        })
        return token;
    }

    verifyRefreshToken(token: string): AccessTokenPayloadType{
        try {
            return this.jwtService.verify(token,{
                secret: process.env.REFRESH_TOKEN_SECRET
            })
        } catch (error) {
            throw new UnauthorizedException(AuthMessage.LoginAgain);
        }
    }
    signEmailTOken(payload: EmailPayloadType){
        const token =  this.jwtService.sign(payload,{
            secret: process.env.EMAIL_TOKEN_SECRET,
            expiresIn: 60*2
        })
        return token;
    }

    verifyEmailToken(token: string): EmailPayloadType{
        try {
            return this.jwtService.verify(token,{
                secret: process.env.EMAIL_TOKEN_SECRET
            })
        } catch (error) {
            throw new BadRequestException(BadRequestMessage.SomthinError);
        }
    }
    signPhoneTOken(payload: PhonePayloadType){
        const token =  this.jwtService.sign(payload,{
            secret: process.env.Phone_TOKEN_SECRET,
            expiresIn: 60*2
        })
        return token;
    }

    verifyPhoneToken(token: string): PhonePayloadType{
        try {
            return this.jwtService.verify(token,{
                secret: process.env.PHONE_TOKEN_SECRET
            })
        } catch (error) {
            throw new BadRequestException(BadRequestMessage.SomthinError);
        }
    }

    signToken(payload: AccessTokenPayloadType){
        const accessToken = this.signAccessTOken(payload);
        const refreshToken = this.signRefreshTOken(payload);
        return {
            accessToken,refreshToken
        }
    }
}