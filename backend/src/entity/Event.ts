import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { Scene } from "./Scene";
import type { Log } from "./Log";

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    status: string; // Replace StreamStatus enum with string

    @Column('text', { default: 'Live' }) // Change enum type to a plain text column
    type: string; // Use string instead of StreamType enum

    @Column('text')
    url: string;

    @Column('text', { nullable: true })
    thumbnail: string;

    @Column('boolean', { default: false })
    loop: boolean;

    @OneToMany('Scene', 'event', { cascade: true })
    scenes: Scene[];

    @OneToMany('Log', 'event', { cascade: true })
    logs: Log[];
}
