import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { IDeviceInfo } from 'src/core/interfaces/entities';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @Column()
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'jsonb', nullable: true })
  deviceInfo: IDeviceInfo;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @BeforeInsert()
  setExpiresAt() {
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    }
  }
}
