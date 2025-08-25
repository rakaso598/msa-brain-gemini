import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Health check 엔드포인트는 API 키 검사 제외
    if (request.url === '/health' || request.url === '/') {
      return true;
    }

    const apiKey = request.headers['x-api-key'] || request.headers['api-key'];
    const validApiKey = this.configService.get<string>('MY_API_KEY');

    if (!validApiKey) {
      throw new UnauthorizedException('Server configuration error: API key not configured');
    }

    if (!apiKey) {
      throw new UnauthorizedException('API key is required. Please provide API key in x-api-key header.');
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key provided');
    }

    return true;
  }
}
