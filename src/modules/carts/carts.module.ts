import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { UsersModule } from '../users/users.module';
import { CartDetailsModule } from '../cart_details/cart_details.module';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Cart]),
        UsersModule,
        forwardRef(() => CartDetailsModule),
    ],
    controllers: [CartsController],
    providers: [CartsService],
    exports: [CartsService]
})
export class CartsModule {}
