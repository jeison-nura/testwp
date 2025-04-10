import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ProcessPaymentUseCase } from './../../application/use-cases/process-payment.use-case';
import { ProductDto } from 'src/application/dtos/product.dto';
import { ValidationPipe } from '../pipes/product.pipe';
@Controller('payments')
export class PaymentController {
  constructor(private readonly ProcessPaymentUseCase: ProcessPaymentUseCase) {}

  @Post()
  async ProcessPayment(@Body(new ValidationPipe()) dto: ProductDto) {
    const result = await this.ProcessPaymentUseCase.execute(dto);
    if (result.isErr()) {
      throw new HttpException(
        result.getError().message,
        HttpStatus.BAD_REQUEST,
      );
    }

    return result.getValue();
  }
}
