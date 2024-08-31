import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Event } from "./Event";

@Entity()
export class Scene {

    @PrimaryGeneratedColumn()
    id: number

    @Column('text')
    location: string

    @Column('text', { default: '' })
    metadata: string

    @ManyToOne(() => Event, (event) => event.scenes)
    event: Event
}
