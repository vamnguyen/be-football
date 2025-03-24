import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { Prediction } from './prediction.entity';
import { BaseEntity } from './base.entity';
import { League } from './league.entity';
import { SPORTS } from '../core/enums/sports.enum';

@Entity('matches')
export class Match extends BaseEntity {
  @Column()
  homeTeam: string;

  @Column()
  awayTeam: string;

  @Column()
  matchDate: Date;

  @Column()
  matchTime: string;

  @ManyToOne(() => League, (league) => league.matches)
  league: League;

  @Column({ type: 'enum', enum: SPORTS })
  sport: SPORTS;

  @Column({ nullable: true })
  thumbnail?: string;

  @Column({ default: false })
  isFinished: boolean;

  @Column({ nullable: true })
  score?: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo?: {
    games?: number;
    platform?: string;
    gameTitle?: string;
  };

  @OneToMany(() => Prediction, (prediction) => prediction.match)
  predictions: Prediction[];
}
