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
import { Like, Repository } from 'typeorm';
import { GroupsService } from '../groups/groups.service';
import { User } from './entities/user.entity';
import { hashPasswordHelper } from 'src/helpers/utils';
import aqp from 'api-query-params';
import { CodeDto } from '../auths/dto/codeDto';
import * as dayjs from 'dayjs';
import { v4 as uuid4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly groupsService: GroupsService,
    private readonly mailerService: MailerService,
  ) {}

  async verifyEmail(token: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { codeId: token },
      });

      if (!user) {
        throw new BadRequestException('Token không hợp lệ');
      }

      if (dayjs().isAfter(user.codeExpired)) {
        throw new BadRequestException('Token đã hết hạn');
      }

      user.isActive = 1;
      user.codeId = null; // Xóa token sau khi xác thực
      user.codeExpired = null;
      await this.userRepository.save(user);

      return { message: 'Xác thực tài khoản thành công' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Lỗi khi xác thực email:', error.message);
      throw new InternalServerErrorException('Không thể xác thực email');
    }
  }

  async isEmailExist(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      return !!user;
    } catch (error) {
      console.error('Lỗi khi kiểm tra email tồn tại:', error.message);
      throw new InternalServerErrorException(
        'Không thể kiểm tra email, vui lòng thử lại sau.',
      );
    }
  }

  async isPhoneExist(phone: string) {
    try {
      const user = await this.userRepository.findOne({ where: { phone } });
      return !!user;
    } catch (error) {
      console.error('Lỗi khi kiểm tra phone tồn tại:', error.message);
      throw new InternalServerErrorException(
        'Không thể kiểm tra phone, vui lòng thử lại sau.',
      );
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { name, email, password, score, phone, address } = createUserDto;

      if (await this.isEmailExist(email)) {
        throw new ConflictException(`Email đã tồn tại`);
      }

      if (await this.isPhoneExist(phone)) {
        throw new ConflictException(`Số điện thoại đã tồn tại`);
      }

      const hashPassword = await hashPasswordHelper(password);
      const user = this.userRepository.create({
        name,
        email,
        password: hashPassword,
        score,
        phone,
        address,
        isActive: 0,
      });

      const group = await this.groupsService.findOne(+createUserDto.groupId);
      if (!group) {
        throw new NotFoundException('Không tìm thấy nhóm người dùng');
      }
      user.group = group;

      const savedUser = await this.userRepository.save(user);

      // Tạo mã xác thực (UUID)
      const codeId = uuid4();
      await this.userRepository.update(savedUser.id, {
        codeId,
        codeExpired: dayjs().add(1, 'hour').toDate(), // Hết hạn sau 1 giờ
      });

      // Gửi email xác thực
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${codeId}`;
      await this.mailerService.sendMail({
        to: email,
        subject: 'BMart Email Verification',
        template: 'verify-email', // File HTML của email
        context: {
          name,
          verificationUrl, // Gửi link xác thực
        },
      });

      return {
        message:
          'Tạo người dùng thành công, vui lòng kiểm tra email để xác thực',
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo người dùng:', error.message);
      throw new InternalServerErrorException('Không thể tạo người dùng');
    }
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
      customer.group = group;

      return await this.userRepository.save(customer);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo khách hàng:', error.message);
      throw new InternalServerErrorException('Không thể tạo khách hàng');
    }
  }

  async findAll(
    query: any,
    current: number,
    pageSize: number,
    groupId: number,
  ) {
    try {
      const { filter, sort } = aqp(query);

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      delete filter.current;
      delete filter.pageSize;
      delete filter.groupId;

      const { name, phone } = filter;

      const whereConditions: any = {};

      if (groupId) {
        whereConditions.group = { id: groupId };
      }

      if (name) {
        whereConditions.name = Like(`%${name}%`);
      }

      if (phone) {
        whereConditions.phone = Like(`%${phone}%`);
      }

      const totalItems = await this.userRepository.count({
        where: whereConditions,
      });
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;

      const options = {
        where: whereConditions,
        take: pageSize,
        relations: ['group'],
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tìm tất cả người dùng:', error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu người dùng',
      );
    }
  }

  async findOneById(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException(`Không tìm thấy người dùng`);
      return user;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi tìm người dùng với ID ${id}:`, error.message);
      throw new InternalServerErrorException('Không thể tìm người dùng');
    }
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['group', 'group.roles'],
      });
      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error(
        `Lỗi khi tìm người dùng với email ${email}:`,
        error.message,
      );
      throw new InternalServerErrorException('Không thể tìm người dùng');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findOneById(id);
      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng');
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
      return await this.userRepository.save(user);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi cập nhật người dùng:', error.message);
      throw new InternalServerErrorException('Không thể cập nhật người dùng');
    }
  }

  async remove(id: number) {
    try {
      const user = await this.findOneById(id);
      if (!user) throw new NotFoundException('Không tìm thấy người dùng');

      await this.userRepository.softDelete(id);
      return user;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi xóa người dùng với ID ${id}:`, error.message);
      throw new InternalServerErrorException('Không thể xóa người dùng');
    }
  }

  async handleCheckCode(codeDto: CodeDto) {
    const user = await this.findOneById(+codeDto.id);
    if (user.codeId !== codeDto.code) {
      throw new BadRequestException('Mã code không hợp lệ');
    }

    const isBeforeExpired = dayjs().isBefore(user?.codeExpired);
    if (isBeforeExpired) {
      await this.userRepository.update(codeDto.id, { isActive: 1 });
      return { isBeforeExpired };
    } else {
      throw new BadRequestException('Mã code đã hết hạn');
    }
  }

  async handleRetryActive(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }
    if (user.isActive) {
      throw new BadRequestException('Tài khoản đã được kích hoạt');
    }
    const codeId = uuid4();
    await this.userRepository.update(user.id, {
      codeId: codeId,
      codeExpired: dayjs().add(1, 'minute'),
    });
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'BMart Activation code', // Subject line
      text: 'welcome', // plaintext body
      template: 'register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    });
    return { id: user.id };
  }

  async handleRetryPassword(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    const codeId = uuid4();
    await this.userRepository.update(user.id, {
      codeId: codeId,
      codeExpired: dayjs().add(1, 'minute'),
    });
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'BMart Change password code', // Subject line
      text: 'welcome', // plaintext body
      template: 'register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    });
    return { id: user.id, email: user.email };
  }
}
