import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ProcessPaymentUseCase } from 'src/application/use-cases/process-payment.use-case';
import { UpdateProductUseCase } from 'src/application/use-cases/update-product.use-case';
import { ProductEntity } from 'src/domain/entities/product.entity';
import { ProductDto } from 'src/application/dtos/product.dto';
import { Result } from 'src/common/result';
import { Status } from 'src/domain/transactions/status.enum';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let entityManager: EntityManager;
  let configService: ConfigService;
  let jwtService: JwtService;
  let updateProductStockUseCase: UpdateProductUseCase;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    // Create mocks
    mockQueryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    const mockEntityManager = {
      transaction: jest.fn((callback) => callback(mockEntityManager)),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      save: jest.fn().mockImplementation((entity) => Promise.resolve({...entity, id: 'generated-id'})),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key, defaultValue) => {
        const config = {
          'INTEGRITY_SECRET': 'test-integrity-secret',
          'PAYMENT_TOKEN_SECRET': 'test-token-secret',
          'PUBLIC_KEY': 'test-public-key',
        };
        return config[key] || defaultValue;
      }),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('test-jwt-token'),
    };

    const mockUpdateProductStockUseCase = {
      execute: jest.fn().mockResolvedValue(Result.ok({})),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPaymentUseCase,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UpdateProductUseCase,
          useValue: mockUpdateProductStockUseCase,
        },
      ],
    }).compile();

    useCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
    entityManager = module.get<EntityManager>(EntityManager);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
    updateProductStockUseCase = module.get<UpdateProductUseCase>(UpdateProductUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should process payment successfully', async () => {
      // Arrange
      const productDto: ProductDto = {
        id: 'test-product-id',
        quantity: 2,
        userEmail: 'test@example.com',
        userId: 'test-user-id',
      };

      const mockProduct = new ProductEntity();
      mockProduct.id = productDto.id;
      mockProduct.price = 100; // $100
      mockProduct.quantity = 5;

      // Setup mock query results
      mockQueryBuilder.getOne.mockResolvedValue(mockProduct);

      // Act
      const result = await useCase.execute(productDto);

      // Assert
      expect(result.isOk()).toBe(true);
      
      // Check that product stock was updated
      expect(updateProductStockUseCase.execute).toHaveBeenCalledWith({
        productId: productDto.id,
        quantity: productDto.quantity,
        entityManager: expect.anything(),
      });
      
      // Check that payment session was created
      expect(entityManager.save).toHaveBeenCalledWith(expect.objectContaining({
        productId: productDto.id,
        userId: productDto.userId,
        userEmail: productDto.userEmail,
        sessionToken: expect.any(String),
        expiresAt: expect.any(Date),
      }));
      
      // Check that transaction was created
      expect(entityManager.save).toHaveBeenCalledWith(expect.objectContaining({
        sessionId: 'generated-id', // From the mock implementation
        amount: 20000, // $100 * 2 * 100 cents
        status: Status.PENDING,
      }));
      
      // Check that JWT token was generated
      expect(jwtService.sign).toHaveBeenCalled();
      
      // Check the returned response structure
      const response = result.getValue();
      expect(response).toBeDefined();
      
      // Since TransactionEntity doesn't have paymentConfig property,
      // let's test what we know should be in the response
      expect(response.transaction.id).toBe('generated-id');
      expect(response.transaction.amount).toBe(20000);
      expect(response.transaction.status).toBe(Status.PENDING);
      expect(response.transaction.sessionId).toBe('generated-id');
      expect(response.transaction.quantity).toBe(2);
      
      // Check that the JWT was generated with the correct payload
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionId: 'generated-id',
          amount: 20000,
        }),
        expect.any(Object)
      );
      
      // Check payment config properties
      expect(response.paymentConfig.publicKey).toBe('test-public-key');
      expect(response.paymentConfig.currency).toBe('COP');
      expect(response.paymentConfig.amountInCents).toBe(20000);
      expect(response.paymentConfig.paymentToken).toBe('test-jwt-token');
      
      // Check transaction properties
      const transaction = response.transaction;
      expect(transaction.id).toBe('generated-id');
      expect(transaction.amount).toBe(20000);
      expect(transaction.status).toBe(Status.PENDING);
      expect(transaction.sessionId).toBe('generated-id');
      expect(transaction.quantity).toBe(2);
    });

    it('should return error if product is not found', async () => {
      // Arrange
      const productDto: ProductDto = {
        id: 'non-existent-id',
        quantity: 2,
        userEmail: 'test@example.com',
      };

      // Setup mock query results
      mockQueryBuilder.getOne.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(productDto);

      // Assert
      expect(result.isErr()).toBe(true);
      expect(result.getError().message).toBe('Product not found');
    });

    it('should return error if stock update fails', async () => {
      // Arrange
      const productDto: ProductDto = {
        id: 'test-product-id',
        quantity: 10, // More than available
        userEmail: 'test@example.com',
      };

      const mockProduct = new ProductEntity();
      mockProduct.id = productDto.id;
      mockProduct.price = 100;
      mockProduct.quantity = 5; // Less than requested

      // Setup mock query results
      mockQueryBuilder.getOne.mockResolvedValue(mockProduct);
      
      // Mock stock update failure
      jest.spyOn(updateProductStockUseCase, 'execute').mockResolvedValue(
        Result.err(new Error('Insufficient stock'))
      );

      // Act
      const result = await useCase.execute(productDto);

      // Assert
      expect(result.isErr()).toBe(true);
      expect(result.getError().message).toBe('Insufficient stock');
    });
  });
});