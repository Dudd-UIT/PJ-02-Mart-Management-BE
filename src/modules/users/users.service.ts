import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupsService } from '../groups/groups.service';
import { User } from './entities/user.entity';
import { hashPasswordHelper } from 'src/hepers/utils';
import { MailerService } from '@nestjs-modules/mailer';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly groupsService: GroupsService,
    // private readonly mailerService: MailerService,
  ) {}

  async isEmailExist(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) return true;
    return false;
  }

  async create(createUserDto: CreateUserDto) {
    const { name, username, email, password, score, phone, address } =
      createUserDto;

    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(`Email đã tồn tại: ${email}`);
    }

    const existingUserByPhone = await this.userRepository.findOne({
      where: { phone: createUserDto.phone },
    });

    if (existingUserByPhone) {
      throw new ConflictException('Số điện thoại đã tồn tại');
    }

    const hashPassword = await hashPasswordHelper(password);
    const user = this.userRepository.create({
      name,
      username,
      email,
      password: hashPassword,
      score,
      phone,
      address,
    });
    const group = await this.groupsService.findOne(+createUserDto.groupId);
    user.group = group;

    const savedUser = this.userRepository.save(user);
    return savedUser;
  }

  async createCustomer(createCustomerDto: CreateCustomerDto) {
    try {
      const { name, phone } = createCustomerDto;
      const groupId = 3;

      const existingUserByPhone = await this.userRepository.findOne({
        where: { phone },
      });

      if (existingUserByPhone) {
        throw new ConflictException('Số điện thoại đã tồn tại');
      }

      const customer = this.userRepository.create({
        name,
        phone,
      });
      const group = await this.groupsService.findOne(+groupId);
      if (!group) {
        throw new NotFoundException('Group không tồn tại');
      }

      customer.group = group;

      const savedCustomer = await this.userRepository.save(customer);
      return savedCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new InternalServerErrorException('Không thể tạo khách hàng');
    }
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
    groupId: number,
  ) {
    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    delete filter.current;
    delete filter.pageSize;
    delete filter.groupId;

    if (groupId) {
      filter.group = { id: groupId };
    }

    const totalItems = await this.userRepository.count({
      where: filter,
    });
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const options = {
      where: filter,
      take: pageSize,
      skip: skip,
      order: sort || {},
    };

    const results = await this.userRepository.find(options);

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      results,
    };
  }

  async findOneById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ${id}`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUserByEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUserByEmail) {
        throw new ConflictException('Email đã tồn tại');
      }
    }

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingUserByPhone = await this.userRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      if (existingUserByPhone) {
        throw new ConflictException('Số điện thoại đã tồn tại');
      }
    }

    if (updateUserDto.groupId) {
      const group = await this.groupsService.findOne(updateUserDto.groupId);
      if (!group) {
        throw new NotFoundException('Không tìm thấy nhóm người dùng');
      }
      user.group = group;
    }
    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return await this.userRepository.softDelete(id);
  }

  // async handleRegister(registerDto: CreateAuthDto) {
  //   const { name, email, password } = registerDto;

  //   const isExist = await this.isEmailExist(email);
  //   if (isExist) {
  //     throw new BadRequestException(`Email đã tồn tại: ${email}`);
  //   }

  //   const hashPassword = await hashPasswordHelper(password);
  //   const codeId = uuid4();

  //   const user = await this.userRepository.create({
  //     name,
  //     email,
  //     password: hashPassword,
  //     codeId: codeId,
  //     codeExpired: dayjs().add(1, 'minute'),
  //   });

  //   this.mailerService.sendMail({
  //     to: user.email, // list of receivers
  //     subject: 'MR.BUOI Activation code', // Subject line
  //     text: 'welcome', // plaintext body
  //     template: 'register',
  //     context: {
  //       name: user?.name ?? user.email,
  //       activationCode: codeId,
  //     },
  //   });

  //   return {
  //     _id: user._id,
  //   };
  // }

  // async handleCheckCode(codeDto: CodeDto) {
  //   const user = await this.userRepository.findOne({
  //     _id: codeDto.id,
  //     codeId: codeDto.code,
  //   });
  //   if (!user) {
  //     throw new BadRequestException('Mã code không hợp lệ');
  //   }
  //   const isBeforeExpired = dayjs().isBefore(user?.codeExpired);
  //   if (isBeforeExpired) {
  //     await this.userRepository.updateOne(
  //       { _id: codeDto.id },
  //       { isActive: true },
  //     );
  //     return { isBeforeExpired };
  //   } else {
  //     throw new BadRequestException('Mã code đã hết hạn');
  //   }
  // }

  // async handleRetryActive(email: string) {
  //   const user = await this.userRepository.findOne({ email });
  //   if (!user) {
  //     throw new BadRequestException('Tài khoản không tồn tại');
  //   }
  //   if (user.isActive) {
  //     throw new BadRequestException('Tài khoản đã được kích hoạt');
  //   }
  //   const codeId = uuid4();
  //   await this.userRepository.updateOne(
  //     { _id: user._id },
  //     { codeId: codeId, codeExpired: dayjs().add(1, 'minute') },
  //   );
  //   this.mailerService.sendMail({
  //     to: user.email, // list of receivers
  //     subject: 'MR.BUOI Activation code', // Subject line
  //     text: 'welcome', // plaintext body
  //     template: 'register',
  //     context: {
  //       name: user?.name ?? user.email,
  //       activationCode: codeId,
  //     },
  //   });
  //   return { _id: user._id };
  // }

  // async handleRetryPassword(email: string) {
  //   const user = await this.userRepository.findOne({ email });
  //   if (!user) {
  //     throw new BadRequestException('Tài khoản không tồn tại');
  //   }

  //   const codeId = uuid4();
  //   await this.userRepository.updateOne(
  //     { _id: user._id },
  //     { codeId: codeId, codeExpired: dayjs().add(1, 'minute') },
  //   );
  //   this.mailerService.sendMail({
  //     to: user.email, // list of receivers
  //     subject: 'MR.BUOI Change password code', // Subject line
  //     text: 'welcome', // plaintext body
  //     template: 'register',
  //     context: {
  //       name: user?.name ?? user.email,
  //       activationCode: codeId,
  //     },
  //   });
  //   return { _id: user._id, email: user.email };
  // }

  // async handleChangePassword(changePasswordDto: ChangePasswordDto) {
  //   if (changePasswordDto.password !== changePasswordDto.confirmPassword) {
  //     throw new BadRequestException(
  //       'Mật khẩu mới không đồng nhất với mật khẩu xác nhận',
  //     );
  //   }
  //   const user = await this.userRepository.findOne({
  //     email: changePasswordDto.email,
  //   });
  //   if (!user) {
  //     throw new BadRequestException('Tài khoản không tồn tại');
  //   }

  //   const isBeforeExpired = dayjs().isBefore(user?.codeExpired);
  //   if (isBeforeExpired) {
  //     const newPassword = await hashPasswordHelper(changePasswordDto.password);
  //     await this.userRepository.updateOne(
  //       { _id: user.id },
  //       { password: newPassword },
  //     );
  //     return { isBeforeExpired };
  //   } else {
  //     throw new BadRequestException('Mã code đã hết hạn');
  //   }
  // }
}
