import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export const PATCH = async (
    request: Request,
    { params }: { params: Promise<{ shopId: string }> }
) => {
    try {
        const { shopId } = await params
        const shopExists = await prisma.shop.findUnique({
            where: { id: shopId },
        })

        if (!shopExists) {
            return new NextResponse('Shop not found', { status: 404 })
        }

        const publishedShop = await prisma.shop.update({
            where: { id: shopId },
            data: { isPublished: true },
        })

        revalidateTag('shops')
        return NextResponse.json(publishedShop)
    } catch (error) {
        console.log('[PUBLISH SHOP ERROR]', error)
        return new NextResponse('internal error', { status: 500 })
    }
}


