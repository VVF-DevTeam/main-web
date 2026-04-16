import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'
import { ExpenseCategoryType, ExpensePaymentMethod } from '@prisma/client'

type ReceiptItemInput = {
  description: string
  quantity: number
  unitPrice: number
  taxAmount?: number
  discount?: number
  lineTotal: number
}

type ReceiptInput = {
  id?: string
  receiptNumber?: string
  receiptDate?: string
  merchantName: string
  merchantAddress?: string
  currency?: string
  subtotal?: number
  taxAmount?: number
  tipAmount?: number
  discountAmount?: number
  totalAmount: number
  note?: string
  paymentMethod?: ExpensePaymentMethod
  paymentReference?: string
  hasReimbursed?: boolean
  category?: ExpenseCategoryType
  receiptImageUrl?: string
  rawText?: string
  items?: ReceiptItemInput[]
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = (await req.json()) as { receipt?: ReceiptInput }
    const receipt = payload.receipt

    if (!receipt || !receipt.merchantName || typeof receipt.totalAmount !== 'number') {
      return NextResponse.json(
        { error: 'merchantName and totalAmount are required' },
        { status: 400 },
      )
    }

    const created = await prisma.receipt.create({
      data: {
        userId: session.user.id,
        receiptNumber: receipt.receiptNumber || null,
        receiptDate: receipt.receiptDate ? new Date(receipt.receiptDate) : new Date(),
        merchantName: receipt.merchantName,
        merchantAddress: receipt.merchantAddress || null,
        currency: receipt.currency || 'CAD',
        subtotal: receipt.subtotal ?? 0,
        taxAmount: receipt.taxAmount ?? 0,
        tipAmount: receipt.tipAmount ?? 0,
        discountAmount: receipt.discountAmount ?? 0,
        totalAmount: receipt.totalAmount,
        note: receipt.note || null,
        paymentMethod: receipt.paymentMethod || ExpensePaymentMethod.Other,
        paymentReference: receipt.paymentReference || null,
        hasReimbursed: receipt.hasReimbursed ?? false,
        category: receipt.category || ExpenseCategoryType.Other,
        receiptImageUrl: receipt.receiptImageUrl || null,
        rawText: receipt.rawText || null,
        items: {
          create: (receipt.items || []).map((item) => ({
            description: item.description || '',
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0,
            taxAmount: item.taxAmount ?? 0,
            discount: item.discount ?? 0,
            lineTotal: item.lineTotal ?? 0,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    revalidateTag('receipts')
    return NextResponse.json({ success: true, receipt: created }, { status: 201 })
  } catch (error) {
    console.error('Create receipt error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = (await req.json()) as { receipt?: ReceiptInput }
    const receipt = payload.receipt

    if (
      !receipt?.id ||
      !receipt.merchantName ||
      typeof receipt.totalAmount !== 'number'
    ) {
      return NextResponse.json(
        { error: 'id, merchantName and totalAmount are required' },
        { status: 400 },
      )
    }

    const existing = await prisma.receipt.findUnique({
      where: { id: receipt.id },
      select: { id: true, userId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.receiptItem.deleteMany({ where: { receiptId: receipt.id } })

      return tx.receipt.update({
        where: { id: receipt.id },
        data: {
          receiptNumber: receipt.receiptNumber || null,
          receiptDate: receipt.receiptDate ? new Date(receipt.receiptDate) : new Date(),
          merchantName: receipt.merchantName,
          merchantAddress: receipt.merchantAddress || null,
          currency: receipt.currency || 'CAD',
          subtotal: receipt.subtotal ?? 0,
          taxAmount: receipt.taxAmount ?? 0,
          tipAmount: receipt.tipAmount ?? 0,
          discountAmount: receipt.discountAmount ?? 0,
          totalAmount: receipt.totalAmount,
          note: receipt.note || null,
          paymentMethod: receipt.paymentMethod || ExpensePaymentMethod.Other,
          paymentReference: receipt.paymentReference || null,
          hasReimbursed: receipt.hasReimbursed ?? false,
          category: receipt.category || ExpenseCategoryType.Other,
          receiptImageUrl: receipt.receiptImageUrl || null,
          rawText: receipt.rawText || null,
          items: {
            create: (receipt.items || []).map((item) => ({
              description: item.description || '',
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice ?? 0,
              taxAmount: item.taxAmount ?? 0,
              discount: item.discount ?? 0,
              lineTotal: item.lineTotal ?? 0,
            })),
          },
        },
        include: {
          items: true,
        },
      })
    })

    revalidateTag('receipts')
    return NextResponse.json({ success: true, receipt: updated }, { status: 200 })
  } catch (error) {
    console.error('Update receipt error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = (await req.json()) as { id?: string }
    const receiptId = payload.id

    if (!receiptId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existing = await prisma.receipt.findUnique({
      where: { id: receiptId },
      select: { id: true, userId: true, hasReimbursed: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.receipt.update({
      where: { id: receiptId },
      data: { hasReimbursed: !existing.hasReimbursed },
      select: { id: true, hasReimbursed: true },
    })

    revalidateTag('receipts')
    return NextResponse.json({ success: true, receipt: updated }, { status: 200 })
  } catch (error) {
    console.error('Toggle reimbursed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

