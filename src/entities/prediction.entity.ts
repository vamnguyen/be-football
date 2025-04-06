import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Match } from './match.entity';
import { User } from './user.entity';
import { PREDICTION_TYPE } from '../core/enums';

@Entity('predictions')
export class Prediction {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Match, (match) => match.predictions, {
    createForeignKeyConstraints: false,
  })
  match: Match;

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
