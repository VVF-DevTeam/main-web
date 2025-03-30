let isRegistered = false

export const registerCustomImageBlot = async () => {
  if (typeof window === 'undefined' || isRegistered) return

  const Quill = (await import('quill')).default
  const BlockEmbed = Quill.import('blots/block/embed')

  class CustomImageBlot extends BlockEmbed {
    static blotName = 'customImage'
    static tagName = 'img'

    static create(value: { src: string; width?: string; height?: string }) {
      const node = super.create() as HTMLImageElement
      node.setAttribute('src', value.src)
      if (value.width) node.setAttribute('width', value.width)
      if (value.height) node.setAttribute('height', value.height)
      return node
    }

    static value(node: HTMLImageElement) {
      return {
        src: node.getAttribute('src') || '',
        width: node.getAttribute('width') || '',
        height: node.getAttribute('height') || '',
      }
    }
  }

  Quill.register(CustomImageBlot)
  isRegistered = true
}