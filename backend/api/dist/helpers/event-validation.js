// on update checks
//if started then dont start
// if stopped then dont stop
// if was stopped and moving to started then start streaming
import { StreamStatus } from '../enums';
export const checkIfStatusUpdateisValid = (currentEventStatus, incomingEventStatus) => {
    if (currentEventStatus === StreamStatus.Started && incomingEventStatus === StreamStatus.Started) {
        return false;
    }
    if (currentEventStatus === StreamStatus.Stopped && incomingEventStatus === StreamStatus.Stopped) {
        return false;
    }
    return true;
};
export const checkIfAttempingEventRestart = (currentEventStatus, incomingEventStatus) => {
    if (currentEventStatus === StreamStatus.Stopped && incomingEventStatus === StreamStatus.Started) {
        return true;
    }
    else {
        return false;
    }
};
//# sourceMappingURL=event-validation.js.map