import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecommendationService {
  private readonly recommendationServiceUrl: string;

  constructor(private readonly httpService: HttpService) {}

  async getRecommendations(customerId: number) {
    try {
      console.log('customerId:::', customerId);
      const recommendationServiceUrl = process.env.RECOMMENDATION_SERVICE_URL;
      console.log(
        'URL::: ',
        `${recommendationServiceUrl}/recommendations/${customerId}`,
      );

      const response = await firstValueFrom(
        this.httpService.get(
          `${recommendationServiceUrl}/recommendations/${customerId}`,
        ),
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }
}
