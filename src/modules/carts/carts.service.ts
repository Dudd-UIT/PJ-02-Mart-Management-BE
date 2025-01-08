import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CartDetailsService } from '../cart_details/cart_details.service';
import { CreateCartAndCartDetailsDto } from './dto/create-cart_cart-detail.dto';
import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => CartDetailsService))
    private readonly cartDetailsService: CartDetailsService,
  ) {}

  async createCartAndCartDetails(
    createCartAndCartDetailsDto: CreateCartAndCartDetailsDto,
  ) {
    const { cartDto, cartDetailsDto } = createCartAndCartDetailsDto;
  
    try {
      // Check if the customer already has a cart
      let cart = await this.cartRepository.findOne({
        where: { customer: { id: cartDto.customerId } },
        relations: ['customer'],
      });
  
      if (!cart) {
        const customer = await this.usersService.findOneById(cartDto.customerId);
        if (!customer) {
          throw new NotFoundException('Không tìm thấy mã khách hàng');
        }
  
        cart = this.cartRepository.create({
          customer,
          status: 1,
          cartDetails: [],
        });
  
        cart = await this.cartRepository.save(cart);
      }
  
      for (const cartDetail of cartDetailsDto) {
        await this.cartDetailsService.create({
          ...cartDetail,
          cartId: cart.id,
        });
      }
  
      return {
        message: 'Giỏ hàng và chi tiết giỏ hàng đã được tạo thành công.',
        cart,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo đơn hàng:', error.message);
      throw new InternalServerErrorException(
        'Có lỗi xảy ra trong quá trình tạo đơn hàng.',
      );
    }
  }
  

  async create(createCartDto: CreateCartDto) {
  //   const cart = this.cartRepository.create(createCartDto);
  //   if (createCartDto.customerId) {
  //     const customer = await this.usersService.findOneById(
  //       createCartDto.customerId,
  //     );
  //     if (!customer) {
  //       throw new NotFoundException('Không tìm thấy mã khách hàng');
  //     }
  //     cart.customer = customer;
  //   }
  //   const savedCart = this.cartRepository.save(cart);
  //   return savedCart;
  // }

  // async findOne(id: number) {
  //   const cart = await this.cartRepository.findOne({
  //     where: { id },
  //   });

  //   if (!cart) {
  //     throw new NotFoundException('Không tìm thấy giỏ hàng');
  //   }

  //   return cart;
  }

  async findOne(id: number) {
    const cart = await this.cartRepository.findOne({
      where: { id },
    });

    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    return cart;
  }

  async findOneByCustomerId(customerId: number) {
    console.log('customerId', customerId)
    // const cart = await this.cartRepository.findOne({
    //   where: { customer: { id: customerId } },
    //   relations: [
    //     'customer', 
    //     'cartDetails',
    //     'cartDetails.productUnit',
    //     'cartDetails.productUnit.productSample',
    //     'cartDetails.productUnit.unit',
    //     'cartDetails.productUnit.batches',
    //   ],
    // });
    const cart = await this.cartRepository
    .createQueryBuilder('cart')
    .leftJoinAndSelect('cart.customer', 'customer')
    .leftJoinAndSelect('cart.cartDetails', 'cartDetails')
    .leftJoinAndSelect('cartDetails.productUnit', 'productUnit')
    .leftJoinAndSelect('productUnit.productSample', 'productSample')
    .leftJoinAndSelect('productUnit.unit', 'unit')
    .leftJoinAndSelect('productUnit.batches', 'batches', 'batches.id = cartDetails.batchId') // Lọc batch theo batchId
    .where('cart.customer.id = :customerId', { customerId })
    .getOne();
    console.log('cart', cart)
  
    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng cho khách hàng này');
    }
  
    return cart;
  }
  
}
