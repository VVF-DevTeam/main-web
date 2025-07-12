import { describe, expect, test } from '@jest/globals'
import { getEventStatus } from './getEventStatus'

describe('Testing getEventStatus function', () => {
  test('should return "Upcoming" if the event is in the future', () => {
    expect(getEventStatus(new Date('2999-02-01'), new Date('2999-02-02'))).toBe('Upcoming')
  })
  test('should return "Ongoing" if the event is in the past', () => {
    expect(getEventStatus(new Date('2024-02-01'), new Date('2999-02-02'))).toBe('Ongoing')
  })
  test('should return "Finished" if the event is in the past', () => {
    expect(getEventStatus(new Date('2024-02-01'), new Date('2024-02-02'))).toBe('Finished')
  })
})
