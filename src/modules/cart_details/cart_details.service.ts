import { 
    BadRequestException, 
    ConflictException, 
    forwardRef, 
    Inject, 
    Injectable, 
    InternalServerErrorException, 
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartDetail } from './entities/cart_detail.entity';
import { Repository } from 'typeorm';
import { CartsService } from '../carts/carts.service';
import { ProductUnitsService } from '../product_units/product_units.service';
import { ProductUnit } from '../product_units/entities/product_unit.entity';
import { CreateCartDetailDto } from './dto/create-cart_detail.dto';
import { BatchsService } from '../batchs/batchs.service';

@Injectable()
export class CartDetailsService {

    constructor(
        @InjectRepository(CartDetail)
        private readonly cartDetailRepository: Repository<CartDetail>,
        @Inject(forwardRef(() => CartsService))
        private readonly cartsService: CartsService,
        private readonly productUnitsService: ProductUnitsService,
        private readonly batchsService: BatchsService,
        @InjectRepository(ProductUnit)
        private readonly productUnitRepository: Repository<ProductUnit>,
    ) {}

    async create(createCartDetailDto: CreateCartDetailDto) {
        try {
          const { cartId, productUnitId, batch, quantity } = createCartDetailDto;
      
          const cart = await this.cartsService.findOne(cartId);
          if (!cart) {
            throw new NotFoundException('Không tìm thấy giỏ hàng');
          }
      
          const productUnit = await this.productUnitsService.findOne(productUnitId);
          if (!productUnit) {
            throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
          }
      
          for (const batchItem of batch) {
            if (!batchItem.id) {
              throw new BadRequestException('Batch phải có id');
            }
      
            const cartDetail = this.cartDetailRepository.create({
              cart,
              productUnit,
              quantity,
              batchId: batchItem.id,
            });
      
            await this.cartDetailRepository.save(cartDetail);
          }
      
          return {
            message: 'Đã tạo chi tiết giỏ hàng thành công.',
          };
        } catch (error) {
          if (
            error instanceof NotFoundException ||
            error instanceof ConflictException ||
            error instanceof BadRequestException
          ) {
            throw error;
          }
          console.error('Lỗi khi tạo chi tiết giỏ hàng:', error.message);
          throw new InternalServerErrorException(
            'Không thể tạo chi tiết giỏ hàng, vui lòng thử lại sau.',
          );
        }
      }
      
    async findOne(id: number) {
      const cartDetail = await this.cartDetailRepository.findOne({
        where: { id },
      });
  
      if (!cartDetail) {
        throw new NotFoundException('Không tìm thấy chi tiết giỏ hàng');
      }
  
      return cartDetail;
    }

    async remove(id: number) {
      const cartDetail = await this.findOne(id);
      if (!cartDetail) {
        throw new NotFoundException('Không tìm thấy chi tiết giỏ hàng');
      }
  
      return await this.cartDetailRepository.delete(id);
    }
}
