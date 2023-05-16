import { join } from 'node:path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
// db.json file path
// const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, 'db.json');
// Configure lowdb to write data to JSON file
const adapter = new JSONFile(file);
const defaultData = { posts: [] };
const db = new Low(adapter, defaultData);
const events = [];
export const createLiveEvent = (liveEvent) => {
    const newLiveEvent = Object.assign({ id: '1234' }, liveEvent);
    events.push(newLiveEvent);
    return newLiveEvent;
};
export const getLiveEvent = (id) => {
    const event = events.find((event) => event.id === id);
    if (event) {
        return event;
    }
    else {
        return null;
    }
};
