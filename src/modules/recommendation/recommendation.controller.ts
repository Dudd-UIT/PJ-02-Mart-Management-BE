import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { ResponseMessage } from 'src/decorators/customDecorator';

@Controller('recommendation')
export class RecommendationController {

    constructor(private readonly recommendationService: RecommendationService) {}

    @Get(':customerId')
    @ResponseMessage('Trả về thông tin danh sách sản phẩm đề xuất thành công')
    // @UseGuards(RoleGuard)
    // @Roles('v_carts')
    async getRecommendations(
      @Param('customerId') customerId: number,
    ) {
      return this.recommendationService.getRecommendations(customerId);
    }
  
    @ResponseMessage('Hello from recommendation controller')
    @Get()
    // @UseGuards(RoleGuard)
    // @Roles('v_carts')
    async getRecHello() {
      return "hello from recommendation"
    }
}
