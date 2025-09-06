import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Project } from '../../projects/entities/project.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  company_name: string;

  @Column()
  contact_email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'boolean', default: false })
  IsAdmin: boolean;

  // Relations
  @OneToMany(() => Project, project => project.user)
  projects: Project[];
}
