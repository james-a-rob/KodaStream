import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Scene } from "./Scene";
import { Log } from "./Log";

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

    @OneToMany(() => Scene, (scene) => scene.event, { cascade: true })
    scenes: Scene[]

    @OneToMany(() => Scene, (log) => log.event, { cascade: true })
    logs: Log[]

}
