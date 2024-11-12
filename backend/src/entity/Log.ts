import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from "typeorm"
import type { Event } from "./Event";
import { LogType } from "../enums";

@Entity()
export class Log {

    @PrimaryGeneratedColumn()
    id: number

    @Column('text')
    datetime: string

    @Column('text')
    sessionId: string

    @Column('text', { nullable: true })
    name?: string

    @Column('text', { nullable: true })
    url?: string

    @Column('text')
    type: LogType


    @ManyToOne('Event', 'logs')
    event: Relation<Event>
}
