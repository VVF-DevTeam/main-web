// Components
import CreateShopFormComponent from '@/app/[locale]/(Home)/shop/(Admin)/_components/CreateShop'

interface CreateShopFormProps {
  ownerId: string
  locale: string
}

export default function CreateShopForm({
  ownerId,
  locale,
}: CreateShopFormProps) {
  return (
    <div className="mx-auto my-40 w-full max-w-5xl p-8 lg:p-12 xl:p-16">
      <CreateShopFormComponent
        ownerId={ownerId}
        redirectToProfile={{ locale }}
      />
    </div>
  )
}

