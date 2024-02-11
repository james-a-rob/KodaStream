// on update checks
//if started then dont start
// if stopped then dont stop
// if was stopped and moving to started then start streaming
import { StreamStatus } from '../enums';

export const checkIfStatusUpdateisValid = (currentEventStatus: StreamStatus, incomingEventStatus: StreamStatus) => {
    if (currentEventStatus === StreamStatus.Started && incomingEventStatus === StreamStatus.Started) {
        return false;
    }
    return true
}

export const isAttempingEventRestart = () => {

}