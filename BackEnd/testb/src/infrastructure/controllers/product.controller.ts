import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';

@Controller('products')
export class ProductController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  async getAllProducts() {
    const result = await this.getProductsUseCase.execute();
    if (result.isErr()) {
      throw new HttpException(
        result.getError().message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.getValue();
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    const result = await this.getProductsUseCase.getById(id);
    if (result.isErr()) {
      throw new HttpException(result.getError().message, HttpStatus.NOT_FOUND);
    }

    return result.getValue();
  }
}
