import { describe, it, expect, vi, afterEach } from 'vitest'
import { getEventStatus } from './getEventStatus'

afterEach(() => {
  vi.useRealTimers()
})

describe('getEventStatus', () => {
  it('returns Upcoming when current date is before start date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01'))
    const result = getEventStatus(new Date('2024-02-01'), new Date('2024-02-10'))
    expect(result).toBe('Upcoming')
  })

  it('returns Ongoing when current date is within the range', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-02-05'))
    const result = getEventStatus(new Date('2024-02-01'), new Date('2024-02-10'))
    expect(result).toBe('Ongoing')
  })

  it('returns Finished when current date is after end date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-02-11'))
    const result = getEventStatus(new Date('2024-02-01'), new Date('2024-02-10'))
    expect(result).toBe('Finished')
  })
})
