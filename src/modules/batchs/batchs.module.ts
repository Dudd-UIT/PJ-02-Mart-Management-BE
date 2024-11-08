// batchs.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { BatchsService } from './batchs.service';
import { BatchsController } from './batchs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { InboundReceiptModule } from '../inbound_receipt/inbound_receipt.module';
import { ProductUnitsModule } from '../product_units/product_units.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch]),
    forwardRef(() => InboundReceiptModule), // Use forwardRef here
    ProductUnitsModule,
  ],
  controllers: [BatchsController],
  providers: [BatchsService],
  exports: [BatchsService],
})
export class BatchsModule {}
