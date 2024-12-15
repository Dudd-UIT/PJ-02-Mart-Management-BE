// inbound_receipt.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { InboundReceiptService } from './inbound_receipt.service';
import { InboundReceiptController } from './inbound_receipt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboundReceipt } from './entities/inbound_receipt.entity';
import { UsersModule } from '../users/users.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { BatchsModule } from '../batchs/batchs.module';
import { Batch } from '../batchs/entities/batch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InboundReceipt]),
    UsersModule,
    SuppliersModule,
    forwardRef(() => BatchsModule), // Use forwardRef here
  ],
  controllers: [InboundReceiptController],
  providers: [InboundReceiptService],
  exports: [InboundReceiptService],
})
export class InboundReceiptModule {}
