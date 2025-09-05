import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  project_id: number;

  @Column({ type: 'int' })
  vendor_id: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    comment: 'Match score from 0.00 to 100.00'
  })
  score: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Project, project => project.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Vendor, vendor => vendor.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;
}
