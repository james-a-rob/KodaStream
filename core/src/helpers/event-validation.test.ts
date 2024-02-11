import { checkIfStatusUpdateisValid } from "./event-validation";
import { StreamStatus } from "../enums";
describe('event validation', () => {
    it('does not start and already started event', () => {
        const statusUpdateisValid = checkIfStatusUpdateisValid(StreamStatus.Started, StreamStatus.Started)
        expect(statusUpdateisValid).toBe(false);
    })
})