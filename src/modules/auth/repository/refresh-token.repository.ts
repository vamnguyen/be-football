import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from 'src/entities/refresh-token.entity';
import { BaseRepository } from 'src/core/repositories/base.repository';
import { IDeviceInfo } from 'src/core/interfaces/entities/device-info.interface';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {
    super(refreshTokenRepository);
  }

  async revokeToken(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token: refreshToken },
      { isRevoked: true, revokedAt: new Date() },
    );
  }

  async revokeDeviceTokens(
    userId: string,
    deviceInfo: IDeviceInfo,
  ): Promise<void> {
    // Tìm các token của cùng một thiết bị dựa trên deviceInfo
    const deviceTokens = await this.refreshTokenRepository.find({
      where: { user: { id: userId }, deviceInfo, isRevoked: false },
    });

    // Revoke tất cả token của thiết bị đó
    await Promise.all(
      deviceTokens.map((token) =>
        this.update(token.id, {
          isRevoked: true,
          revokedAt: new Date(),
        }),
      ),
    );
  }

  async findValidToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.refreshTokenRepository.findOneBy({ token });

    if (
      !refreshToken ||
      refreshToken.isRevoked ||
      refreshToken.revokedAt !== null ||
      refreshToken.expiresAt < new Date()
    ) {
      return null;
    }

    return refreshToken;
  }
}
