import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { PREDICTION_TYPE } from '../core/enums';
import { BaseEntity } from './base.entity';

@Entity('predictions')
export class Prediction extends BaseEntity {
  @Column()
  matchId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'text', nullable: true })
  result: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ nullable: true })
  confidence: number;

  @Column({ type: 'jsonb', nullable: true })
  probabilities?: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };

  @Column({ default: false })
  isCorrect: boolean;

  @Column({
    type: 'enum',
    enum: PREDICTION_TYPE,
    default: PREDICTION_TYPE.AI,
  })
  type: PREDICTION_TYPE;
}
