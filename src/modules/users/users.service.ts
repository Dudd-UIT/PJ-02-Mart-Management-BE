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
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly groupsService: GroupsService,
  ) {}

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
        throw new BadRequestException(`Email đã tồn tại: ${email}`);
      }

      if (await this.isPhoneExist(phone)) {
        throw new BadRequestException(`Số điện thoại đã tồn tại: ${phone}`);
      }

      const hashPassword = await hashPasswordHelper(password);
      const user = this.userRepository.create({
        name,
        email,
        password: hashPassword,
        score,
        phone,
        address,
      });

      const group = await this.groupsService.findOne(+createUserDto.groupId);
      user.group = group;

      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
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
      console.error('Lỗi khi tạo khách hàng:', error.message);
      throw new InternalServerErrorException('Không thể tạo khách hàng');
    }
  }

  async findAll(
    query: string,
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
      console.error('Lỗi khi tìm tất cả người dùng:', error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu người dùng',
      );
    }
  }

  async findOneById(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException(`Không tìm thấy người dùng ${id}`);
      return user;
    } catch (error) {
      console.error(`Lỗi khi tìm người dùng với ID ${id}:`, error.message);
      throw new InternalServerErrorException('Không thể tìm người dùng');
    }
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['group'],
      });
      if (!user) {
        // Trả về lỗi NotFoundException nếu không tìm thấy người dùng
        throw new NotFoundException(
          `Không tìm thấy người dùng với email: ${email}`,
        );
      }
      return user;
    } catch (error) {
      // Kiểm tra nếu lỗi đã là NotFoundException, thì ném lại lỗi
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Ghi log lỗi và trả về InternalServerErrorException cho các lỗi khác
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
        user.group = group;
      }

      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
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
      console.error(`Lỗi khi xóa người dùng với ID ${id}:`, error.message);
      throw new InternalServerErrorException('Không thể xóa người dùng');
    }
  }
}
