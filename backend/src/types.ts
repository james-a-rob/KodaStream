import { StreamStatus } from "./enums";


interface VideoScene {
    url: string
}

export interface LiveEventInput {
    url: string
    status: StreamStatus
    scenes: VideoScene[]
}