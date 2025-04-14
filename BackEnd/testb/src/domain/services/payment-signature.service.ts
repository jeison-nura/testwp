import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Result } from 'src/common/result';

export interface SignatureParams {
  reference: string;
  amountInCents: number;
  currency: string;
  expirationDate: string;
}

@Injectable()
export class PaymentSignatureService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  async generateSignature(params: SignatureParams): Promise<Result<string, Error>> {
    try {
      const privateKey = this.configService.get('INTEGRITY_SECRET', '');
      if (!privateKey) {
        return Result.err(new Error('Integrity secret is not configured'));
      }
      
      const integrityConcatenation = `${params.reference}${params.amountInCents}${params.currency}${params.expirationDate}${privateKey}`;

      const encondedText = new TextEncoder().encode(integrityConcatenation);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encondedText);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return Result.ok(hashHex);
    } catch (error) {
      return Result.err(
        error instanceof Error 
          ? error 
          : new Error(`Failed to generate signature: ${error}`)
      );
    }
  }

  getIntegrityConcatenation(params: SignatureParams): Result<string, Error> {
    try {
      const privateKey = this.configService.get('INTEGRITY_SECRET', '');
      if (!privateKey) {
        return Result.err(new Error('Integrity secret is not configured'));
      }
      
      const integrityConcatenation = `${params.reference}${params.amountInCents}${params.currency}${params.expirationDate}${privateKey}`;
      return Result.ok(integrityConcatenation);
    } catch (error) {
      return Result.err(
        error instanceof Error 
          ? error 
          : new Error(`Failed to get integrity concatenation: ${error}`)
      );
    }
  }

  async verifySignature(params: SignatureParams, providedSignature: string): Promise<Result<boolean, Error>> {
    try {
      // Generate a new signature using the same parameters
      const signatureResult = await this.generateSignature(params);
      
      if (signatureResult.isErr()) {
        return Result.err(signatureResult.getError());
      }
      
      const calculatedSignature = signatureResult.getValue();
      
      // Compare the calculated signature with the provided one
      // Using a constant-time comparison to prevent timing attacks
      try {
        const isValid = crypto.timingSafeEqual(
          Buffer.from(calculatedSignature, 'hex'),
          Buffer.from(providedSignature, 'hex')
        );
        
        return Result.ok(isValid);
      } catch (error) {
        // If buffers are of different length or other errors occur
        return Result.ok(false);
      }
    } catch (error) {
      return Result.err(
        error instanceof Error 
          ? error 
          : new Error(`Failed to verify signature: ${error}`)
      );
    }
  }
}