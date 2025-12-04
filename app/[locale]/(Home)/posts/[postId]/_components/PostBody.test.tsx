// PostBody.test.tsx
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostBody from './PostBody'
import { ImageProps, StaticImageData } from 'next/image'

// 1) Mock next/image to a plain <img> for easy assertions
vi.mock('next/image', () => {
  const MockImage = (props: ImageProps) => {
    const src =
      typeof props.src === 'string'
        ? props.src
        : (props.src as StaticImageData).src

    {/* eslint-disable-next-line @next/next/no-img-element */}
    return <img data-testid="post-image" alt={props.alt} src={src} />
  }

  return { __esModule: true, default: MockImage }
})

// 2) Mock TextPreview with the EXACT path used in PostBody.tsx
//    (PostBody imports from '../../../../components/TextPreview')
vi.mock('../../../../components/TextPreview', () => ({
  __esModule: true,
  default: ({ value }: { value: string }) => (
    <div data-testid="text-preview">{value}</div>
  ),
}))

describe('PostBody', () => {
  const baseProps = {
    title: 'Test Post Title',
    content: 'This is the content shown via TextPreview.',
    imageUrl: '/test-image.jpg',
    createdAt: new Date('2024-01-01T12:00:00Z'),
    author: 'Test Author',
  }

  test('renders title, author, date, image, and content', () => {
    render(<PostBody {...baseProps} />)

    // Title
    expect(screen.getByText(baseProps.title)).toBeInTheDocument()

    // Author ("By <author>")
    expect(screen.getByText(/By/i)).toBeInTheDocument()
    expect(screen.getByText(baseProps.author)).toBeInTheDocument()

    // Date — allow common locale formats
    const dateRegex = /(1\/1\/2024|Jan(uary)?\s?1,?\s?2024|2024-01-01)/i
    expect(screen.getByText(dateRegex)).toBeInTheDocument()

    // Image
    const img = screen.getByTestId('post-image')
    expect(img).toHaveAttribute('src', baseProps.imageUrl)
    expect(img).toHaveAttribute('alt', baseProps.title)

    // Content via mocked TextPreview
    expect(screen.getByTestId('text-preview')).toHaveTextContent(
      baseProps.content
    )
  })

  test('works with long title/content and different date', () => {
    const props = {
      ...baseProps,
      title:
        'This is a very long post title that should render correctly and not break layout',
      content:
        'This is a very long content string that should be rendered by TextPreview in full.',
      createdAt: new Date('2025-12-25T10:00:00Z'),
    }

    render(<PostBody {...props} />)

    expect(screen.getByText(props.title)).toBeInTheDocument()
    expect(screen.getByTestId('text-preview')).toHaveTextContent(props.content)

    const dateRegex = /(12\/25\/2025|Dec(ember)?\s?25,?\s?2025|2025-12-25)/i
    expect(screen.getByText(dateRegex)).toBeInTheDocument()
  })

  test('renders gracefully when imageUrl is missing', () => {
    const props = { ...baseProps, imageUrl: '' }
    render(<PostBody {...props} />)

    // Content still shows
    expect(screen.getByTestId('text-preview')).toHaveTextContent(props.content)

    // No image rendered
    expect(screen.queryByTestId('post-image')).not.toBeInTheDocument()
  })
})
