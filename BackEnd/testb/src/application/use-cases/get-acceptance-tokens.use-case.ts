import { Injectable } from '@nestjs/common';
import { PaymentGatewayService } from 'src/infrastructure/services/payment-gateway.service';
import { Result } from 'src/common/result';
import { MerchantAcceptanceTokens } from 'src/infrastructure/interfaces/merchant-acceptance-tokens.interface';

@Injectable()
export class GetAcceptanceTokensUseCase {
  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  async execute(): Promise<Result<MerchantAcceptanceTokens, Error>> {
    try {
      const tokensResult = await this.paymentGatewayService.getMerchantAcceptanceTokens();
      
      if (tokensResult.isErr()) {
        return Result.err(tokensResult.getError());
      }
      
      return Result.ok(tokensResult.getValue());
    } catch (error) {
      return Result.err(
        error instanceof Error 
          ? error 
          : new Error(`Failed to get acceptance tokens: ${error}`)
      );
    }
  }
}