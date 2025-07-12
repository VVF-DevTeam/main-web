import { describe, expect, test } from '@jest/globals'
import { getRemainSessions } from './getRemainSessions'

describe('Testing getRemainSessions function', () => {
    test('should return 0 if the event has already ended', async () => {
        const eventId = 'cm6yy39zt0003ugl0qyxgzm7s'
        const remainSessions = await getRemainSessions(eventId)
        expect(remainSessions).toBe(0)
    })
})