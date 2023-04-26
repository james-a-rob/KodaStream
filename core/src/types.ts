import { StreamStatus } from "./enums";

interface VideoScene {
    url: string
}
export interface LiveEvent {
    id: string,
    status: StreamStatus
    scenes: VideoScene[]
}

export interface LiveEventInput {
    url: string
    status: StreamStatus
    scenes: VideoScene[]
}