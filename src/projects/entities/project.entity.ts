import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Match } from '../../matches/entities/match.entity';
import { ProjectStatus } from '../../common/enums/project-status.enum';
import { ServiceType } from '../../common/enums/service-type.enum';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'json' })
  services_needed: ServiceType[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  budget: number;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT
  })
  status: ProjectStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Match, match => match.project)
  matches: Match[];
}
