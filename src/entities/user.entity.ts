import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { RefreshToken } from './refresh-token.entity';
import { FOOTBALL_TEAMS } from '../core/enums';
import { hashSync, genSaltSync, compareSync } from 'bcrypt';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  lastName: string;

  @Column({ type: 'boolean', default: false })
  terms: boolean;

  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @Column({ type: 'enum', enum: FOOTBALL_TEAMS, nullable: true })
  favoriteTeam: FOOTBALL_TEAMS | null;

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    if (this.password) {
      const salt = genSaltSync(10);
      this.password = hashSync(this.password, salt);
    }
  }

  comparePassword(passwordReceived: string): boolean {
    return compareSync(passwordReceived, this.password);
  }
}
