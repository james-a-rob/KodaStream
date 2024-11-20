import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from "typeorm"
import type { Event } from "./Event";

@Entity()
export class Scene {

    @PrimaryGeneratedColumn()
    id: number

    @Column('text')
    location: string

    @Column('text', { nullable: true })
    metadata: string

    @ManyToOne('Event', 'scenes')
    event: Event
}
