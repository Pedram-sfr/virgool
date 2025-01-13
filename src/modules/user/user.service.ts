import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { isDate } from 'class-validator';
import { Gender } from './enums/gender.enum';
import { ChangeUsernameDto, ProfileDto } from './dto/profile.dto';
import { ProfileImageType } from './types/files.type';
import { AuthMessage, BadRequestMessage, ConflictMessage, PublicMessage } from 'src/common/enums/message.enum';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../auth/tokens.service';
import { OtpEntity } from './entities/otp.entity';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { AuthMethod } from '../auth/enums/method.enum';
import { FollowEntity } from './entities/follow.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.util';
import { BlockDto } from '../auth/dto/auth.dto';
import { UserStatus } from './enums/status.enum';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    @InjectRepository(FollowEntity) private followRepository: Repository<FollowEntity>,
    @Inject(REQUEST) private request: Request,
    private authService: AuthService,
    private tokenService: TokenService
  ) { }

  //profile
  async changeProfile(files: ProfileImageType, profileDto: ProfileDto) {
    if (files.image_profile?.length > 0) {
      let [image] = files.image_profile;
      profileDto.image_profile = image?.path?.replaceAll("\\", "/").slice(7)
    }
    if (files.bg_image?.length > 0) {
      let [image] = files.bg_image;
      profileDto.bg_image = image?.path?.replaceAll("\\", "/").slice(7)
    }
    const { id: userId, profileId } = this.request.user;
    let profile = await this.profileRepository.findOneBy({ userId });
    const { nick_name, bio, birthday, gender, linkedin_profile, image_profile, bg_image } = profileDto;
    if (profile) {
      if (bio) profile.bio = bio;
      if (birthday && isDate(new Date(birthday))) profile.birthday = birthday;
      if (gender && Object.values(Gender as any).includes(gender)) profile.gender = gender;
      if (linkedin_profile) profile.linkedin_profile = linkedin_profile;
      if (nick_name) profile.nick_name = nick_name;
      if (image_profile) profile.image_profile = image_profile;
      if (bg_image) profile.bg_image = bg_image;
    } else {
      profile = this.profileRepository.create({ userId, nick_name, bio, birthday, gender, linkedin_profile, bg_image, image_profile })
    }
    profile = await this.profileRepository.save(profile);
    if (!profileId)
      await this.userRepository.update({ id: userId }, { profileId: profile.id });
    return {
      message: PublicMessage.Updated
    }
  }

  profile() {
    const { id } = this.request.user
    return this.userRepository.createQueryBuilder(EntityName.User)
      .where({ id })
      .leftJoinAndSelect("user.profile", "profile")
      .loadRelationCountAndMap("user.followers", "user.followers")
      .loadRelationCountAndMap("user.following", "user.following")
      .getOne();
  }

  async changeEmail(email: string) {
    const { id } = this.request.user;
    let user = await this.userRepository.findOneBy({ email })
    if (user && user.id !== id)
      throw new ConflictException(ConflictMessage.Email)
    else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated
      }
    }
    await this.userRepository.update({ id }, {
      new_email: email
    })
    const otp = await this.authService.sendAndSaveOTP(id, AuthMethod.Email);
    const token = this.tokenService.signEmailTOken({ email });
    return {
      code: otp.code,
      token
    }
  }

  async verifyEmail(code: string) {
    const { id: userId, new_email } = this.request.user;
    console.log(this.request.user);

    const emailToken = this.request.cookies?.[CookieKeys.EmailOTP];
    if (!emailToken) throw new BadRequestException((AuthMessage.ExpiredCode));
    const { email } = this.tokenService.verifyEmailToken(emailToken);
    const otp = await this.checkOtp(userId, code);
    console.log(email, new_email);

    if (email !== new_email)
      throw new BadRequestException(BadRequestMessage.SomthinError);
    if (otp.method !== AuthMethod.Email)
      throw new BadRequestException(BadRequestMessage.SomthinError);
    await this.userRepository.update({ id: userId }, {
      email,
      verify_email: true,
      new_email: null
    });
    return {
      message: PublicMessage.Updated
    }
  }
  async changePhone(phone: string) {
    const { id } = this.request.user;
    let user = await this.userRepository.findOneBy({ phone })
    if (user && user.id !== id)
      throw new ConflictException(ConflictMessage.Phone)
    else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated
      }
    }
    await this.userRepository.update({ id }, {
      new_phone: phone
    })
    const otp = await this.authService.sendAndSaveOTP(id, AuthMethod.Phone);
    const token = this.tokenService.signPhoneTOken({ phone });
    return {
      code: otp.code,
      token
    }
  }

  async verifyPhone(code: string) {
    const { id: userId, new_phone } = this.request.user;
    const token = this.request.cookies?.[CookieKeys.PhoneOTP];
    if (!token) throw new BadRequestException((AuthMessage.ExpiredCode));
    const { phone } = this.tokenService.verifyPhoneToken(token);
    const otp = await this.checkOtp(userId, code);

    if (phone !== new_phone)
      throw new BadRequestException(BadRequestMessage.SomthinError);
    if (otp.method !== AuthMethod.Phone)
      throw new BadRequestException(BadRequestMessage.SomthinError);
    await this.userRepository.update({ id: userId }, {
      phone,
      verify_phone: true,
      new_phone: null
    });
    return {
      message: PublicMessage.Updated
    }
  }

  async checkOtp(userId: number, code: string) {
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new BadRequestException(AuthMessage.TryAgain)
    if (otp.expiresIn < new Date())
      throw new BadRequestException(AuthMessage.ExpiredCode)
    if (otp.code !== code)
      throw new BadRequestException(AuthMessage.IncorrectCode)
    return otp;
  }

  async changeUsername(usernameDto: ChangeUsernameDto) {
    const { username } = usernameDto;
    const { id, username: userNameReq } = this.request.user
    const user = await this.userRepository.findOneBy({ username });
    if (user && user.id !== id)
      throw new BadRequestException(BadRequestMessage.SomthinError)
    else if (userNameReq === username)
      return { message: PublicMessage.Updated }
    await this.userRepository.update({ id }, {
      username
    });
    return {
      message: PublicMessage.Updated
    }
  }

  async follow(followingId: number) {
    const { id: userId } = this.request.user;
    const following = await this.userRepository.findOneBy({ id: followingId });
    if (!following)
      throw new NotFoundException(PublicMessage.NotFound);
    const isFollowing = await this.followRepository.findOneBy({ followerId: userId, followingId });
    let message: PublicMessage;
    if (isFollowing) {
      await this.followRepository.remove(isFollowing);
      message = PublicMessage.UnFollow
    } else {
      await this.followRepository.insert({
        followerId: userId,
        followingId
      })
      message = PublicMessage.Follow
    }
    return {
      message
    }
  }

  async followers(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const { id } = this.request.user;
    const [followers, count] = await this.followRepository.findAndCount({
      where: {
        followingId: id
      },
      relations: {
        follower: {
          profile: true
        }
      },
      select: {
        id: true,
        follower: {
          username: true,
          profile: {
            id: true,
            nick_name: true,
            bio: true,
            image_profile: true
          }
        }
      },
      skip,
      take: limit
    })

    return {
      pagination: paginationGenerator(count, page, limit),
      followers
    }
  }
  async following(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const { id } = this.request.user
    const [following, count] = await this.followRepository.findAndCount({
      where: {
        followerId: id
      },
      relations: {
        following: {
          profile: true
        }
      },
      select: {
        id: true,
        following: {
          username: true,
          profile: {
            id: true,
            nick_name: true,
            bio: true,
            image_profile: true
          }
        }
      },
      skip,
      take: limit
    })

    return {
      pagination: paginationGenerator(count, page, limit),
      following
    }
  }

  async blockUserToggle(blockDto: BlockDto) {
    const { userId } = blockDto;
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user)
      throw new NotFoundException(PublicMessage.NotFound);
    let message = PublicMessage.Blocked;
    if (user.status === UserStatus.Block) {
      await this.userRepository.update({ id: userId }, { status: null })
      message = PublicMessage.UnBlocked;
    } else {
      await this.userRepository.update({ id: userId }, { status: UserStatus.Block });
    }
    return {
      message
    }
  }
}
