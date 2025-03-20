import { Entity, Column, ManyToOne } from 'typeorm';
import { Match } from './match.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('predictions')
export class Prediction extends BaseEntity {
  @ManyToOne(() => Match, (match) => match.predictions)
  match: Match;

  @ManyToOne(() => User)
  user: User;

  @Column('text')
  prediction: string;

  @Column({ nullable: true })
  confidence: number;

  @Column({ nullable: true })
  actualResult?: string;

  @Column({ default: false })
  isCorrect: boolean;
}
