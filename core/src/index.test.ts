import { createLiveEvent, getLiveEvent } from './';

test('create live event', () => {
  expect(createLiveEvent()).toEqual({id: "1", status: 'not-started'});
});

test('get live event by id', () => {
    createLiveEvent();
    expect(getLiveEvent("1")).toEqual({id: "1", status: 'not-started'});
  });