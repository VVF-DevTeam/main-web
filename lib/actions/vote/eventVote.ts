'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'
import { Role } from '@prisma/client'
import { canAccessEventPaymentData } from '@/lib/actions/payment/canAccessEventPaymentData'
import {
  getOrCreateVoterDeviceToken,
  readVoterDeviceToken,
} from '@/lib/actions/vote/voterDevice'
import { displayVoterLabel } from '@/lib/actions/vote/maskEmail'
import {
  getVotingWindowStatus,
  isVotingOpen,
  type VotingWindowStatus,
} from '@/lib/actions/vote/votingWindow'
import {
  validateCastSelection,
  validateSelectionLimits,
} from '@/lib/actions/vote/selectionLimits'

export type PublicVoteOption = {
  id: string
  label: string
  position: number
  voteCount: number
}

export type PublicVoteBallot = {
  id: string
  optionId: string
  optionLabel: string
  displayName: string
  createdAt: Date
  isMine: boolean
}

export type PublicEventVote = {
  id: string
  eventId: string
  question: string
  description: string | null
  allowChangeVote: boolean
  minSelections: number
  maxSelections: number
  votingStartsAt: Date | null
  votingEndsAt: Date | null
  votingStatus: VotingWindowStatus
  isVotingOpen: boolean
  totalVotes: number
  options: PublicVoteOption[]
  ballots: PublicVoteBallot[]
  /** Null until this device or account has voted. optionIds are the current picks. */
  mySelections: {
    optionIds: string[]
    nickname: string | null
  } | null
}

async function findVoterBallots(
  voteId: string,
  userId: string | null,
  deviceToken: string | null
) {
  const or: Array<{ userId: string } | { deviceToken: string }> = []
  if (userId) or.push({ userId })
  if (deviceToken) or.push({ deviceToken })
  if (or.length === 0) return []

  return prisma.eventVoteBallot.findMany({
    where: { voteId, OR: or },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getPublicEventVote(
  eventId: string
): Promise<PublicEventVote | null> {
  const vote = await prisma.eventVote.findUnique({
    where: { eventId },
    include: {
      options: { orderBy: { position: 'asc' } },
      ballots: {
        include: {
          option: { select: { id: true, label: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!vote || !vote.isEnabled) return null

  const ballots = vote.ballots ?? []
  const options = vote.options ?? []

  const session = await auth()
  const userId = session?.user?.id ?? null
  const deviceToken = await readVoterDeviceToken()
  const mine = ballots.filter(
    (ballot) =>
      (userId !== null && ballot.userId === userId) ||
      (deviceToken !== null && ballot.deviceToken === deviceToken)
  )
  const mineIds = new Set(mine.map((ballot) => ballot.id))
  const now = new Date()
  const votingStatus = getVotingWindowStatus(
    vote.votingStartsAt,
    vote.votingEndsAt,
    now
  )
  const votingOpen = isVotingOpen(vote.votingStartsAt, vote.votingEndsAt, now)

  const counts = new Map<string, number>()
  for (const option of options) counts.set(option.id, 0)
  for (const ballot of ballots) {
    counts.set(ballot.optionId, (counts.get(ballot.optionId) || 0) + 1)
  }

  const minSelections = vote.minSelections ?? 1
  const maxSelections = vote.maxSelections ?? 1

  return {
    id: vote.id,
    eventId: vote.eventId,
    question: vote.question,
    description: vote.description,
    allowChangeVote: vote.allowChangeVote,
    minSelections,
    maxSelections,
    votingStartsAt: vote.votingStartsAt,
    votingEndsAt: vote.votingEndsAt,
    votingStatus,
    isVotingOpen: votingOpen,
    totalVotes: ballots.length,
    options: options.map((option) => ({
      id: option.id,
      label: option.label,
      position: option.position,
      voteCount: counts.get(option.id) || 0,
    })),
    ballots: ballots.map((ballot) => ({
      id: ballot.id,
      optionId: ballot.optionId,
      optionLabel: ballot.option.label,
      displayName: displayVoterLabel(ballot),
      createdAt: ballot.createdAt,
      isMine: mineIds.has(ballot.id),
    })),
    mySelections: mine.length
      ? {
          optionIds: options
            .map((option) => option.id)
            .filter((id) => mine.some((ballot) => ballot.optionId === id)),
          nickname: mine.find((ballot) => ballot.nickname)?.nickname ?? null,
        }
      : null,
  }
}

export async function getEventVoteForAdmin(eventId: string) {
  if (!(await canAccessEventPaymentData(eventId))) {
    return null
  }

  return prisma.eventVote.findUnique({
    where: { eventId },
    include: {
      options: { orderBy: { position: 'asc' } },
      _count: { select: { ballots: true } },
    },
  })
}

export type SaveEventVoteInput = {
  eventId: string
  question: string
  description?: string | null
  isEnabled: boolean
  allowChangeVote: boolean
  minSelections: number
  maxSelections: number
  votingStartsAt?: Date | null
  votingEndsAt?: Date | null
  options: Array<{ id?: string; label: string }>
}

export async function saveEventVote(input: SaveEventVoteInput) {
  if (!(await canAccessEventPaymentData(input.eventId))) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const question = input.question.trim()
  const options = input.options
    .map((o) => ({ id: o.id, label: o.label.trim() }))
    .filter((o) => o.label.length > 0)
  const votingStartsAt = input.votingStartsAt ?? null
  const votingEndsAt = input.votingEndsAt ?? null

  if (!question) {
    return { success: false as const, error: 'Question is required' }
  }
  if (options.length < 2) {
    return {
      success: false as const,
      error: 'Add at least two voting options',
    }
  }
  const limits = validateSelectionLimits(
    input.minSelections,
    input.maxSelections,
    options.length
  )
  if (!limits.ok) {
    return { success: false as const, error: limits.error }
  }
  if (
    votingStartsAt &&
    votingEndsAt &&
    votingStartsAt.getTime() >= votingEndsAt.getTime()
  ) {
    return {
      success: false as const,
      error: 'Voting start must be before voting end',
    }
  }

  const existing = await prisma.eventVote.findUnique({
    where: { eventId: input.eventId },
    include: { options: true },
  })

  if (!existing) {
    await prisma.eventVote.create({
      data: {
        eventId: input.eventId,
        question,
        description: input.description?.trim() || null,
        isEnabled: input.isEnabled,
        allowChangeVote: input.allowChangeVote,
        minSelections: limits.minSelections,
        maxSelections: limits.maxSelections,
        votingStartsAt,
        votingEndsAt,
        options: {
          create: options.map((option, index) => ({
            label: option.label,
            position: index,
          })),
        },
      },
    })
  } else {
    const keepIds = options
      .map((o) => o.id)
      .filter((id): id is string => Boolean(id))

    try {
      await prisma.$transaction(async (tx) => {
        await tx.eventVote.update({
          where: { id: existing.id },
          data: {
            question,
            description: input.description?.trim() || null,
            isEnabled: input.isEnabled,
            allowChangeVote: input.allowChangeVote,
            minSelections: limits.minSelections,
            maxSelections: limits.maxSelections,
            votingStartsAt,
            votingEndsAt,
          },
        })

        // Remove options that were deleted and have no ballots; block delete if ballots exist
        for (const old of existing.options) {
          if (keepIds.includes(old.id)) continue
          const ballotCount = await tx.eventVoteBallot.count({
            where: { optionId: old.id },
          })
          if (ballotCount > 0) {
            throw new Error(
              `Cannot remove option "${old.label}" because it already has votes`
            )
          }
          await tx.eventVoteOption.delete({ where: { id: old.id } })
        }

        for (let index = 0; index < options.length; index++) {
          const option = options[index]!
          if (option.id) {
            await tx.eventVoteOption.update({
              where: { id: option.id },
              data: { label: option.label, position: index },
            })
          } else {
            await tx.eventVoteOption.create({
              data: {
                voteId: existing.id,
                label: option.label,
                position: index,
              },
            })
          }
        }
      })
    } catch (error) {
      return {
        success: false as const,
        error:
          error instanceof Error ? error.message : 'Failed to save vote tool',
      }
    }
  }

  revalidateTag('events')
  return { success: true as const }
}

export type CastVoteInput = {
  eventId: string
  optionIds: string[]
  /** Guest nickname when not logged in */
  nickname?: string
}

/** Pre–multi-select clients sent a single optionId */
type LegacyCastVoteInput = {
  eventId: string
  optionId?: string
  nickname?: string
}

function resolveCastOptionIds(
  input: CastVoteInput | LegacyCastVoteInput
): string[] {
  if ('optionIds' in input && Array.isArray(input.optionIds)) {
    return input.optionIds
  }
  if ('optionId' in input) {
    const legacy = input.optionId?.trim()
    if (legacy) return [legacy]
  }
  return []
}

export async function castEventVote(
  input: CastVoteInput | LegacyCastVoteInput
) {
  const eventId = input.eventId?.trim()
  if (!eventId) {
    return { success: false as const, error: 'Invalid event' }
  }

  const vote = await prisma.eventVote.findUnique({
    where: { eventId },
    include: { options: true },
  })

  if (!vote || !vote.isEnabled) {
    return { success: false as const, error: 'Voting is not available' }
  }

  if (!isVotingOpen(vote.votingStartsAt, vote.votingEndsAt)) {
    const status = getVotingWindowStatus(vote.votingStartsAt, vote.votingEndsAt)
    return {
      success: false as const,
      error:
        status === 'upcoming'
          ? 'Voting has not started yet'
          : 'Voting has ended',
    }
  }

  const minSelections = vote.minSelections ?? 1
  const maxSelections = vote.maxSelections ?? 1
  const selection = validateCastSelection(
    resolveCastOptionIds(input),
    vote.options.map((option) => option.id),
    minSelections,
    maxSelections
  )
  if (!selection.ok) {
    return { success: false as const, error: selection.error }
  }
  const optionIds = selection.optionIds

  const session = await auth()
  const userId = session?.user?.id ?? null
  const voterEmail = session?.user?.email?.trim() || null
  const nickname = input.nickname?.trim() || null

  if (!userId && !nickname) {
    return {
      success: false as const,
      error: 'Enter a nickname or sign in to vote',
    }
  }
  if (nickname && nickname.length > 40) {
    return { success: false as const, error: 'Nickname is too long' }
  }

  const { token: deviceToken } = await getOrCreateVoterDeviceToken()
  const existing = await findVoterBallots(vote.id, userId, deviceToken)

  if (existing.length > 0 && !vote.allowChangeVote) {
    return {
      success: false as const,
      error: 'You already voted and changing votes is disabled',
    }
  }

  const wanted = new Set(optionIds)
  const byOption = new Map<string, typeof existing>()
  for (const ballot of existing) {
    const rows = byOption.get(ballot.optionId) ?? []
    rows.push(ballot)
    byOption.set(ballot.optionId, rows)
  }

  const toDelete: string[] = []
  const toKeep: typeof existing = []
  for (const ballot of existing) {
    if (!wanted.has(ballot.optionId)) toDelete.push(ballot.id)
  }
  for (const optionId of optionIds) {
    const rows = byOption.get(optionId) ?? []
    if (rows.length === 0) continue
    toKeep.push(rows[0]!)
    for (const extra of rows.slice(1)) toDelete.push(extra.id)
  }
  const keptOptionIds = new Set(toKeep.map((ballot) => ballot.optionId))

  try {
    await prisma.$transaction(async (tx) => {
      if (toDelete.length > 0) {
        await tx.eventVoteBallot.deleteMany({
          where: { id: { in: toDelete } },
        })
      }
      for (const ballot of toKeep) {
        await tx.eventVoteBallot.update({
          where: { id: ballot.id },
          data: {
            nickname: userId ? null : nickname,
            voterEmail: userId ? voterEmail : null,
            userId,
            deviceToken,
          },
        })
      }
      const toCreate = optionIds.filter((id) => !keptOptionIds.has(id))
      if (toCreate.length > 0) {
        await tx.eventVoteBallot.createMany({
          data: toCreate.map((optionId) => ({
            voteId: vote.id,
            optionId,
            deviceToken,
            userId,
            voterEmail: userId ? voterEmail : null,
            nickname: userId ? null : nickname,
          })),
        })
      }
    })
  } catch {
    return {
      success: false as const,
      error: 'Could not save your vote. Please try again.',
    }
  }

  return { success: true as const, changed: existing.length > 0 }
}

async function canManageEventVote(eventId: string): Promise<boolean> {
  const session = await auth()
  const roles = (session?.user?.role ?? []) as Role[]
  const canAdmin =
    roles.includes(Role.ADMIN) || roles.includes(Role.SUPERADMIN)
  if (canAdmin) return true
  return canAccessEventPaymentData(eventId)
}

/** Removes all cast ballots; keeps poll question, options, and settings. */
export async function resetEventVoteBallots(eventId: string) {
  if (!(await canManageEventVote(eventId))) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const vote = await prisma.eventVote.findUnique({
    where: { eventId },
    select: { id: true },
  })
  if (!vote) {
    return { success: false as const, error: 'No vote tool configured' }
  }

  const { count } = await prisma.eventVoteBallot.deleteMany({
    where: { voteId: vote.id },
  })

  revalidateTag('events')
  return { success: true as const, deletedCount: count }
}

export async function deleteEventVote(eventId: string) {
  if (!(await canManageEventVote(eventId))) {
    return { success: false as const, error: 'Unauthorized' }
  }

  await prisma.eventVote.deleteMany({ where: { eventId } })
  revalidateTag('events')
  return { success: true as const }
}
