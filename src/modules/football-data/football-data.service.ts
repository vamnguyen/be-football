import { Injectable, Logger, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '@/modules/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class FootballDataService {
  private readonly logger = new Logger(FootballDataService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
  ) {}

  async getArea(id: number): Promise<any> {
    const cacheKey = `area-${id}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/areas/${id}`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getAreaList(): Promise<any> {
    const cacheKey = 'area-list';
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(`${this.configService.get('footballData.baseUrl')}/areas`, {
          headers: {
            'X-Auth-Token': this.configService.get('footballData.apiKey'),
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getCompetitionList(): Promise<any> {
    const cacheKey = 'competition-list';
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/competitions`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getCompetition(code: string): Promise<any> {
    const cacheKey = `competition-${code}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/competitions/${code}`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getCompetitionStandings({
    code,
    matchday,
    season,
  }: {
    code: string;
    matchday?: number;
    season?: string;
  }): Promise<any> {
    const cacheKey = `competition-${code}-standings-${season}-${matchday}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/competitions/${code}/standings`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
            params: {
              matchday,
              season,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getCompetitionMatches({
    code,
    dateFrom,
    dateTo,
    stage,
    status,
    matchday,
    group,
    season,
  }: {
    code: string;
    dateFrom?: string;
    dateTo?: string;
    stage?: string;
    status?: string;
    matchday?: number;
    group?: string;
    season?: string;
  }): Promise<any> {
    const cacheKey = `competition-${code}-matches-${season}-${matchday}-${group}-${stage}-${status}-${dateFrom}-${dateTo}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/competitions/${code}/matches`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
            params: {
              dateFrom,
              dateTo,
              stage,
              status,
              matchday,
              group,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getCompetitionTeams({
    code,
    season,
  }: {
    code: string;
    season?: string;
  }): Promise<any> {
    const cacheKey = `competition-${code}-teams-${season}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/competitions/${code}/teams`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
            params: {
              season,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getCompetitionScorers({
    code,
    season,
    limit,
  }: {
    code: string;
    season?: string;
    limit?: number;
  }): Promise<any> {
    const cacheKey = `competition-${code}-scorers-${season}-${limit}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/competitions/${code}/scorers`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
            params: {
              limit,
              season,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getTeam(id: number): Promise<any> {
    const cacheKey = `team-${id}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/teams/${id}`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getTeamList({
    offset,
    limit,
  }: {
    offset?: number;
    limit?: number;
  }): Promise<any> {
    const cacheKey = `team-list-${offset}-${limit}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(`${this.configService.get('footballData.baseUrl')}/teams`, {
          headers: {
            'X-Auth-Token': this.configService.get('footballData.apiKey'),
          },
          params: {
            offset,
            limit,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getTeamMatches({
    id,
    dateFrom,
    dateTo,
    season,
    competitions,
    status,
    venue,
    limit,
  }: {
    id: number;
    dateFrom?: string;
    dateTo?: string;
    season?: string;
    competitions?: string;
    status?: string;
    venue?: string;
    limit?: number;
  }): Promise<any> {
    const cacheKey = `team-${id}-matches-${dateFrom}-${dateTo}-${season}-${competitions}-${status}-${venue}-${limit}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/teams/${id}/matches`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
            params: {
              dateFrom,
              dateTo,
              season,
              competitions,
              status,
              venue,
              limit,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getPerson(id: number): Promise<any> {
    const cacheKey = `person-${id}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/persons/${id}`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getPersonMatches({
    id,
    dateFrom,
    dateTo,
    status,
    competitions,
    limit,
    offset,
  }: {
    id: number;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    competitions?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const cacheKey = `person-${id}-matches-${dateFrom}-${dateTo}-${status}-${competitions}-${limit}-${offset}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/persons/${id}/matches`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
            params: {
              dateFrom,
              dateTo,
              status,
              competitions,
              limit,
              offset,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getMatch(id: number): Promise<any> {
    const cacheKey = `match-${id}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/matches/${id}`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getMatchList({
    competitions,
    ids,
    dateFrom,
    dateTo,
    status,
  }: {
    competitions?: string;
    ids?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }): Promise<any> {
    const cacheKey = `match-list-${competitions}-${ids}-${dateFrom}-${dateTo}-${status}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(`${this.configService.get('footballData.baseUrl')}/matches`, {
          headers: {
            'X-Auth-Token': this.configService.get('footballData.apiKey'),
          },
          params: {
            competitions,
            ids,
            dateFrom,
            dateTo,
            status,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }

  async getMatchHead2Head({
    id,
    limit,
    dateFrom,
    dateTo,
    status,
  }: {
    id: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }): Promise<any> {
    const cacheKey = `match-${id}-head2head-${dateFrom}-${dateTo}-${status}-${limit}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `${this.configService.get('footballData.baseUrl')}/matches/${id}/head2head`,
          {
            headers: {
              'X-Auth-Token': this.configService.get('footballData.apiKey'),
            },
            params: {
              dateFrom,
              dateTo,
              status,
              limit,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    await this.redisService.set(cacheKey, data, 1000 * 60 * 60 * 24);
    return data;
  }
}
