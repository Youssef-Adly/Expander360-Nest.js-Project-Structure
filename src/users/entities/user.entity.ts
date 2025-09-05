import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
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
  password: string;

  @Column({ type: 'boolean', default: false })
  IsAdmin: boolean;

  // Relations
  @OneToMany(() => Project, project => project.user)
  projects: Project[];
}
