import React from 'react'

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostImage from './ImageForm'
import { axiosInstance } from '@/lib/axios'
import { toast } from 'sonner'
import type { ImageProps, StaticImageData } from 'next/image'
import { Post } from '@prisma/client'
import { AxiosStatic } from 'axios'
import Image from 'next/image'
// 1) Mock next/image to a plain <img> for easy assertions
vi.mock('next/image', () => {
  const MockImage = (props: ImageProps) => {
    const src =
      typeof props.src === 'string'
        ? props.src
        : (props.src as StaticImageData).src

    return <Image data-testid="next-image" alt={props.alt} src={src} />
  }

  return { __esModule: true, default: MockImage }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/axios', () => ({
  axiosInstance: { put: vi.fn() },
}))

describe('ImageForm', () => {
  beforeEach(() => vi.clearAllMocks())

  test('renders existing image in view mode', () => {
    render(
      <PostImage
        post={{ id: '3', imgUrl: 'https://example.com/pic.jpg' } as Post}
      />
    )
    expect(screen.getByText('Post Image')).toBeInTheDocument()
    const img = screen.getByTestId('next-image')
    expect(img).toHaveAttribute('src', 'https://example.com/pic.jpg')
    expect(screen.getByText(/Edit Image/i)).toBeInTheDocument()
  })

  test('submits updated image url successfully', async () => {
    vi.mocked(axiosInstance.put as AxiosStatic).mockResolvedValueOnce({})

    const { container } = render(
      <PostImage
        post={{ id: '3', imgUrl: 'https://example.com/old.jpg' } as Post}
      />
    )

    fireEvent.click(screen.getByText(/Edit Image/i))

    const input = screen.getByPlaceholderText('Enter Image URL')
    fireEvent.change(input, { target: { value: 'https://cdn.site/new.jpg' } })

    const form = container.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/api/posts/edit/3', {
        imgUrl: 'https://cdn.site/new.jpg',
      })
    })
    expect(toast.success).toHaveBeenCalled()
  })

  test('shows error toast on API failure', async () => {
    vi.mocked(axiosInstance.put as AxiosStatic).mockRejectedValueOnce(
      new Error('fail')
    )

    const { container } = render(
      <PostImage
        post={{ id: '3', imgUrl: 'https://example.com/old.jpg' } as Post}
      />
    )

    fireEvent.click(screen.getByText(/Edit Image/i))

    const input = screen.getByPlaceholderText('Enter Image URL')
    fireEvent.change(input, { target: { value: 'https://cdn.site/new.jpg' } })

    const form = container.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })
})
