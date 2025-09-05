import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Match } from '../../matches/entities/match.entity';
import { ServiceType } from '../../common/enums/service-type.enum';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'json' })
  countries_supported: string[];

  @Column({ type: 'json' })
  services_offered: ServiceType[];

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.00
  })
  rating: number;

  @Column({ type: 'int', default: 24 })
  response_sla_hours: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => Match, match => match.vendor)
  matches: Match[];
}
