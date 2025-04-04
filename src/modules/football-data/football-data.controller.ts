import { Controller } from '@nestjs/common';
import { FootballDataService } from './football-data.service';

@Controller('football-data')
export class FootballDataController {
  constructor(private readonly footballDataService: FootballDataService) {}
}
