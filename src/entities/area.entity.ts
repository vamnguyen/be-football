import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Team } from './team.entity';
import { Competition } from './competition.entity';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  flag: string;

  @OneToMany(() => Team, (team) => team.area)
  teams: Team[];

  @OneToMany(() => Competition, (competition) => competition.area)
  competitions: Competition[];
}
