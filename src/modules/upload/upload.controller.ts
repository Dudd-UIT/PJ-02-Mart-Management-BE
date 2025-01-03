import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from '../auths/passport/guards/roles.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(RoleGuard)
  @Roles('c_pdsam', 'v_pdsams', 'u_pdsam', 'd_pdsam')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const uploadedUrl = await this.uploadService.uploadFile(file);
    return { url: uploadedUrl };
  }
}
