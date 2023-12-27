import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Event } from "./Event";

@Entity()
export class Viewer {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    datetime: string

    @Column()
    sessionId: string

    @ManyToOne(() => Event, (event) => event.scenes)
    event: Event
}
