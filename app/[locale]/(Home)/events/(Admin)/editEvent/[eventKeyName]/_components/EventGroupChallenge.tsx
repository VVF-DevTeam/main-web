'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { axiosInstance } from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Loader from '@/components/loader/Loader'
import {
  getGroupChallengeForAdmin,
  saveGroupChallenge,
  type GroupChallengeReward,
} from '@/lib/actions/challenge/groupChallenge'
import ReferralStatsPanel from '@/app/[locale]/(Home)/profile/_components/ReferralStatsPanel'

interface EventGroupChallengeProps {
  eventId: string
}

const emptyReward = (place: number): GroupChallengeReward => ({
  place,
  title: '',
  description: '',
  imageUrl: '',
})

export default function EventGroupChallenge({ eventId }: EventGroupChallengeProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [title, setTitle] = useState('Group Challenge')
  const [description, setDescription] = useState('')
  const [rewards, setRewards] = useState<GroupChallengeReward[]>([
    emptyReward(1),
    emptyReward(2),
    emptyReward(3),
  ])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const challenge = await getGroupChallengeForAdmin(eventId)
        if (challenge) {
          setIsEnabled(challenge.isEnabled)
          setTitle(challenge.title)
          setDescription(challenge.description)
          if (challenge.rewards.length > 0) setRewards(challenge.rewards)
        }
      } catch (error) {
        console.error(error)
        toast.error('Failed to load the group challenge')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [eventId])

  const updateReward = (index: number, patch: Partial<GroupChallengeReward>) => {
    setRewards((current) =>
      current.map((reward, rewardIndex) =>
        rewardIndex === index ? { ...reward, ...patch } : reward
      )
    )
  }

  const uploadRewardImage = async (index: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axiosInstance.post('/api/events/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    updateReward(index, { imageUrl: response.data.url })
    toast.success('Reward image uploaded')
  }

  const onSave = async () => {
    setSaving(true)
    try {
      const result = await saveGroupChallenge({
        eventId,
        isEnabled,
        title,
        description,
        rewards,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Group challenge saved')
    } catch (error) {
      console.error(error)
      toast.error('Failed to save the group challenge')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Buyers get a personal invite code. Friends who buy with that code join
        the buyer&apos;s group. The public board shows masked names and the
        rewards you set here.
      </p>
      <div className="flex items-center gap-2">
        <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
        <Label>Show the leaderboard on the event and ticket page</Label>
      </div>
      <div className="space-y-1">
        <Label>Leaderboard title</Label>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Invite friends. The group with the most tickets wins."
        />
      </div>
      <div className="space-y-3">
        <Label>Rewards</Label>
        {rewards.map((reward, index) => (
          <div key={index} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[80px_1fr]">
            <div className="space-y-1">
              <Label>Place</Label>
              <Input
                type="number"
                min={1}
                value={reward.place}
                onChange={(event) =>
                  updateReward(index, { place: Number(event.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Input
                value={reward.title}
                onChange={(event) => updateReward(index, { title: event.target.value })}
                placeholder="Reward title"
              />
              <Input
                value={reward.description}
                onChange={(event) =>
                  updateReward(index, { description: event.target.value })
                }
                placeholder="Short description"
              />
              <Input
                value={reward.imageUrl}
                onChange={(event) =>
                  updateReward(index, { imageUrl: event.target.value })
                }
                placeholder="Image URL"
              />
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void uploadRewardImage(index, file)
                }}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setRewards((current) => [...current, emptyReward(current.length + 1)])
          }
        >
          Add reward
        </Button>
      </div>
      <Button type="button" onClick={() => void onSave()} disabled={saving}>
        {saving ? 'Saving...' : 'Save group challenge'}
      </Button>
      <ReferralStatsPanel eventId={eventId} />
    </div>
  )
}
