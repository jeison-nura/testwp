import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from 'src/infrastructure/controllers/payment.controller';
import { ProcessPaymentUseCase } from 'src/application/use-cases/process-payment.use-case';
import { ProductDto } from 'src/application/dtos/product.dto';
import { Result } from 'src/common/result';
import { Status } from 'src/domain/transactions/status.enum';
import { TransactionEntity } from 'src/domain/entities/transaction.entity';
import { PaymentConfig } from 'src/application/interfaces/payment-config.interface';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PaymentController', () => {
  let controller: PaymentController;
  let processPaymentUseCase: ProcessPaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: ProcessPaymentUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    processPaymentUseCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ProcessPayment', () => {
    it('should process payment successfully', async () => {
      // Arrange
      const productDto: ProductDto = {
        id: 'test-product-id',
        quantity: 2,
        userEmail: 'test@example.com',
        userId: 'test-user-id',
      };

      const mockTransaction = new TransactionEntity();
      mockTransaction.id = 'test-transaction-id';
      mockTransaction.amount = 20000;
      mockTransaction.status = Status.PENDING;
      mockTransaction.sessionId = 'test-session-id';
      mockTransaction.quantity = 2;

      // Update the mockPaymentConfig to include the new required properties
      const mockPaymentConfig: PaymentConfig = {
        publicKey: 'test-public-key',
        currency: 'COP',
        amountInCents: 10000,
        paymentToken: 'test-payment-token',
        reference: 'test-reference',
        signature: 'test-signature',
        redirectUrl: 'https://example.com/redirect'
      };

      const mockResponse = {
        transaction: mockTransaction,
        paymentConfig: mockPaymentConfig,
      };

      jest.spyOn(processPaymentUseCase, 'execute').mockResolvedValue(Result.ok(mockResponse));

      // Act
      const result = await controller.ProcessPayment(productDto);

      // Assert
      expect(processPaymentUseCase.execute).toHaveBeenCalledWith(productDto);
      expect(result).toEqual(mockResponse);
    });

    it('should throw HttpException when process payment fails', async () => {
      // Arrange
      const productDto: ProductDto = {
        id: 'test-product-id',
        quantity: 10,
        userEmail: 'test@example.com',
        userId: 'test-user-id',
      };

      jest.spyOn(processPaymentUseCase, 'execute').mockResolvedValue(
        Result.err(new Error('Insufficient stock'))
      );

      // Act & Assert
      await expect(controller.ProcessPayment(productDto)).rejects.toThrow(
        new HttpException('Insufficient stock', HttpStatus.BAD_REQUEST)
      );
    });
  });
});