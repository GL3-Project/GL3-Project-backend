import { UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '@/authentication/guard/local.guard';

export const UseBasicAuth = () => UseGuards(LocalAuthGuard);
