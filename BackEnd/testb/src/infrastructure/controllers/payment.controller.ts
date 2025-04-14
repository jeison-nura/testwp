import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProcessPaymentUseCase } from './../../application/use-cases/process-payment.use-case';
import { CreatePaymentUseCase } from './../../application/use-cases/create-payment.use-case';
import { ProductDto } from 'src/application/dtos/product.dto';
import { ValidationPipe } from '../pipes/product.pipe';
import { CreatePaymentDto } from 'src/application/dtos/create-payment.dto';
import { TransactionData } from 'src/application/interfaces/transaction-response.interface';
import { PaymentTokenGuard } from '../guards/payment-token.guard';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly ProcessPaymentUseCase: ProcessPaymentUseCase,
    private readonly createPaymentUseCase: CreatePaymentUseCase
  ) {}

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
  
  @Post('create')
  //@UseGuards(PaymentTokenGuard)
  async createPayment(@Body(new ValidationPipe()) paymentRequest: CreatePaymentDto): Promise<TransactionData> {
    const result = await this.createPaymentUseCase.execute(paymentRequest);
    
    if (result.isErr()) {
      throw new HttpException(
        result.getError().message,
        HttpStatus.BAD_REQUEST,
      );
    }
    
    return result.getValue();
  }
}
