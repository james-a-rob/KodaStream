import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Event } from "./Event";
import { LogType } from "../enums";

@Entity()
export class Log {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    datetime: string

    @Column()
    sessionId: string

    @Column({ nullable: true })
    name?: string

    @Column({ nullable: true })
    url?: string

    @Column()
    type: LogType


    @ManyToOne(() => Event, (event) => event.scenes)
    event: Event
}
