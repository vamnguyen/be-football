import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'KEYV_INSTANCE',
      useFactory: (configService: ConfigService) => {
        // Redis URI on Local
        const redisUri = `redis://${configService.get('redis.host')}:${configService.get('redis.port')}`;

        // Redis URI on Cloud
        // const redisUri = `redis://${configService.get('redis.username')}:${configService.get('redis.password')}@${configService.get('redis.host')}:${configService.get('redis.port')}`;

        const keyvRedis = new KeyvRedis(redisUri);
        return new Keyv({ store: keyvRedis });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['KEYV_INSTANCE', RedisService],
})
export class RedisModule {}
