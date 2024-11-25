import { IsArray, IsInt } from 'class-validator';

export class FindProductSampleUnitsByIdsDto {
  @IsArray()
  @IsInt({ each: true })
  productUnitIds?: number[];
}
