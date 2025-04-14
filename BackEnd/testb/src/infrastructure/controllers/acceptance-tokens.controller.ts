import { Controller, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GetAcceptanceTokensUseCase } from 'src/application/use-cases/get-acceptance-tokens.use-case';
import { MerchantAcceptanceTokens } from 'src/infrastructure/interfaces/merchant-acceptance-tokens.interface';

@Controller('acceptanceTokens')
export class AcceptanceTokensController {
  private readonly logger = new Logger(AcceptanceTokensController.name);

  constructor(
    private readonly getAcceptanceTokensUseCase: GetAcceptanceTokensUseCase,
  ) {}

  @Get()
  async getAcceptanceTokens(): Promise<MerchantAcceptanceTokens> {
    try {
      const result = await this.getAcceptanceTokensUseCase.execute();

      if (result.isErr()) {
        const error = result.getError();
        this.logger.error(`Failed to get acceptance tokens: ${error.message}`, error.stack);
        
        // Determine appropriate status code based on error
        const statusCode = this.getStatusCodeFromError(error);
        
        throw new HttpException({
          status: statusCode,
          error: 'Failed to retrieve acceptance tokens',
          message: error.message,
          timestamp: new Date().toISOString(),
        }, statusCode);
      }

      return result.getValue();
    } catch (error) {
      // Handle unexpected errors
      this.logger.error(`Unexpected error in getAcceptanceTokens: ${error.message}`, error.stack);
      
      const statusCode = error instanceof HttpException 
        ? error.getStatus() 
        : HttpStatus.INTERNAL_SERVER_ERROR;
        
      throw new HttpException({
        status: statusCode,
        error: 'An unexpected error occurred',
        message: 'Could not process your request at this time',
        timestamp: new Date().toISOString(),
      }, statusCode);
    }
  }

  private getStatusCodeFromError(error: Error): HttpStatus {
    // Map different error types to appropriate HTTP status codes
    if (error.message.includes('not found')) {
      return HttpStatus.NOT_FOUND;
    }
    
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      return HttpStatus.UNAUTHORIZED;
    }
    
    if (error.message.includes('forbidden')) {
      return HttpStatus.FORBIDDEN;
    }
    
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return HttpStatus.GATEWAY_TIMEOUT;
    }
    
    if (error.message.includes('bad request') || error.message.includes('invalid')) {
      return HttpStatus.BAD_REQUEST;
    }
    
    // Default to internal server error
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}