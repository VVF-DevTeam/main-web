// Libraries
import { Shop, ShopItem, ShopItemTag } from '@prisma/client'

// Actions
import { getAllShopItemTags } from '@/lib/actions/shop/shopItem/tag/getShopItemTag'

// Components
import PublishButton from '@/components/ui/PublishButton'
import BackButton from '@/components/ui/back-button'
import ShopTitle from './ShopTitle'
import ShopDescription from './ShopDescription'
import ShopType from './ShopType'
import ShopSlug from './ShopSlug'
import ShopImage from './ShopImage'
import ShopInfo from './ShopInfo'
import ShopItems from './ShopItems'
import ShopDiscounts from './ShopDiscount'
import ShopEvent from './ShopEvent'
import ImageAddInstruction from '@/components/instruction/ImageAddInstruction'
import EditorInstructions from '@/components/instruction/EditorInstructions'

// Type for Shop with relations (matches getShopForEditing return type)
type ShopForEditing = Shop & {
  shopItems: (ShopItem & { tags?: ShopItemTag[] })[]
  event?: {
    id: string
    title: string
    keyName: string
  } | null
}

interface EditShopProps {
  shop: ShopForEditing
  showBackButton?: boolean
}

export default async function EditShop({
  shop,
  showBackButton = false,
}: EditShopProps) {
  const allShopItemTags = await getAllShopItemTags()

  const shopFields = [
    !!shop.title,
    !!shop.description,
    !!shop.type,
    !!shop.slug,
    !!shop.imageUrl,
    shop.shopItems.length >= 0, // At least 0 items (always true, but can be used for validation)
  ]

  const completedFields = shopFields.filter(Boolean).length
  const completionText = `(${completedFields} / ${shopFields.length})`
  const canPublish = completedFields === shopFields.length

  return (
    <div className="my-12 p-6 lg:my-20">
      {showBackButton && <BackButton />}
      <div className="mx-auto my-20 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-3">
            <h1 className="text-2xl font-bold tracking-wide md:text-3xl xl:text-5xl">
              Edit Shop
            </h1>
            <span className="text-sm text-muted-foreground">
              Fill all the required fields to publish your shop.
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              Required steps completed: {completionText}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex-col-center gap-x-4 gap-y-4 md:flex-row">
            <PublishButton
              id={shop.id}
              type={'shop'}
              canPublish={canPublish}
              isPublished={shop.isPublished}
              domain={'shops'}
            />
          </div>
        </div>

        {/* Shop Body */}
        <div className="mt-20 grid grid-cols-1 gap-x-4 gap-y-12 md:grid-cols-2 lg:gap-x-8">
          {/* Title */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step I :</span> Title
            </h2>
            <ShopTitle shop={shop} />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step II :</span> Slug
            </h2>
            <ShopSlug shop={shop} />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step III :</span> Description
            </h2>
            <EditorInstructions />
            <ShopDescription shop={shop} />
          </div>

          {/* Shop Type */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step IV :</span> Shop Type
            </h2>
            <ShopType shop={shop} />
          </div>

          {/* Event */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step V :</span> Link to Event (Optional)
            </h2>
            <ShopEvent shop={shop} />
          </div>

          {/* Image */}
          <div className="col-span-full flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step VI :</span> Image
            </h2>
            <ImageAddInstruction />
            <ShopImage shop={shop} />
          </div>

          {/* Shop Info */}
          <div className="col-span-full flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step VII :</span> Shop Info
            </h2>
            <EditorInstructions />
            <ShopInfo shop={shop} />
          </div>

          {/* Shop Discounts */}
          <div className="col-span-full flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step VIII :</span> Shop Discounts
            </h2>
            <ShopDiscounts shop={shop} />
          </div>

          {/* Shop Items */}
          <div className="col-span-full flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step IX :</span> Shop Items
            </h2>
            <ShopItems shop={shop} allTags={allShopItemTags} />
          </div>
        </div>
      </div>
    </div>
  )
}

