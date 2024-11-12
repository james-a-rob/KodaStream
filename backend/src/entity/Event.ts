import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { Scene } from "./Scene";
import type { Log } from "./Log";

import { StreamStatus } from "../enums";

@Entity()
export class Event {

    @PrimaryGeneratedColumn()
    id: number

    @Column('text')
    status: StreamStatus

    @Column('text')
    url: string

    @Column('boolean', { default: false })
    loop: boolean

    @OneToMany('Scene', 'event', { cascade: true })
    scenes: Scene[];

    @OneToMany('Log', 'event', { cascade: true })
    logs: Log[];

}
