import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PaymentSessionDto } from 'src/application/dtos/payment-session.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class PaymentTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Payment token is missing');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('PAYMENT_TOKEN_SECRET', ''),
      });
      
      // Validate payload against DTO
      const paymentSessionDto = plainToClass(PaymentSessionDto, payload);
      const errors = await validate(paymentSessionDto);
      
      if (errors.length > 0) {
        throw new UnauthorizedException('Invalid payment token payload');
      }
      
      // Add validated payload to request object
      request['paymentSession'] = paymentSessionDto;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid payment token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}