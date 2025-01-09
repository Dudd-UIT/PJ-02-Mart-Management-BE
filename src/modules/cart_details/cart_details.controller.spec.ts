import { Test, TestingModule } from '@nestjs/testing';
import { CartDetailsController } from './cart_details.controller';

describe('CartDetailsController', () => {
  let controller: CartDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartDetailsController],
    }).compile();

    controller = module.get<CartDetailsController>(CartDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
