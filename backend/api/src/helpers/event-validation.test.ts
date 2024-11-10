import { checkIfStatusUpdateisValid, checkIfAttempingEventRestart } from "./event-validation";
import { StreamStatus } from "../enums";
describe('event validation', () => {
    it('does not start and already started event', () => {
        const statusUpdateisValid = checkIfStatusUpdateisValid(StreamStatus.Started, StreamStatus.Started)
        expect(statusUpdateisValid).toBe(false);
    });

    it('does not stop and already stopped', () => {
        const statusUpdateisValid = checkIfStatusUpdateisValid(StreamStatus.Stopped, StreamStatus.Stopped)
        expect(statusUpdateisValid).toBe(false);
    })

    it('stops if not already stopped', () => {
        const statusUpdateisValid = checkIfStatusUpdateisValid(StreamStatus.Started, StreamStatus.Stopped)
        expect(statusUpdateisValid).toBe(true);
    })

    it('starts if currently stopped', () => {
        const statusUpdateisValid = checkIfStatusUpdateisValid(StreamStatus.Stopped, StreamStatus.Started)
        expect(statusUpdateisValid).toBe(true);
    });

    it('checks if attempting a restart', () => {
        const isAttempingEventRestart = checkIfAttempingEventRestart(StreamStatus.Stopped, StreamStatus.Started)
        expect(isAttempingEventRestart).toBe(true);
    });
})