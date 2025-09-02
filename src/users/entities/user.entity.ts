import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
