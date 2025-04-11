import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from 'src/infrastructure/controllers/product.controller';
import { GetProductsUseCase } from 'src/application/use-cases/get-products.use-case';
import { Result } from 'src/common/result';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ProductController', () => {
  let controller: ProductController;
  let getProductsUseCase: GetProductsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: GetProductsUseCase,
          useValue: {
            execute: jest.fn(),
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    getProductsUseCase = module.get<GetProductsUseCase>(GetProductsUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllProducts', () => {
    it('should return all products successfully', async () => {
      // Arrange
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          quantity: 10,
        },
        {
          id: 'product-2',
          name: 'Product 2',
          description: 'Description 2',
          price: 200,
          quantity: 20,
        },
      ];

      jest.spyOn(getProductsUseCase, 'execute').mockResolvedValue(Result.ok(mockProducts));

      // Act
      const result = await controller.getAllProducts();

      // Assert
      expect(getProductsUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });

    it('should throw HttpException when getting products fails', async () => {
      // Arrange
      jest.spyOn(getProductsUseCase, 'execute').mockResolvedValue(
        Result.err(new Error('Database error'))
      );

      // Act & Assert
      await expect(controller.getAllProducts()).rejects.toThrow(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  });

  describe('getProductById', () => {
    it('should return a product by id successfully', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockProduct = {
        id: productId,
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        quantity: 10,
      };

      jest.spyOn(getProductsUseCase, 'getById').mockResolvedValue(Result.ok(mockProduct));

      // Act
      const result = await controller.getProductById(productId);

      // Assert
      expect(getProductsUseCase.getById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });

    it('should throw HttpException when product is not found', async () => {
      // Arrange
      const productId = 'non-existent-id';

      jest.spyOn(getProductsUseCase, 'getById').mockResolvedValue(
        Result.err(new Error('Product not found'))
      );

      // Act & Assert
      await expect(controller.getProductById(productId)).rejects.toThrow(
        new HttpException('Product not found', HttpStatus.NOT_FOUND)
      );
    });
  });
});