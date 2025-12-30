'use client'

import React, { useState } from 'react'
import { X, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Business {
  name: string
  discount: string
  link?: string
}

interface BusinessDiscountModalProps {
  businesses: Business[]
  triggerText: string
}

const BusinessDiscountModal = ({
  businesses,
  triggerText,
}: BusinessDiscountModalProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('membership')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
      >
        {triggerText}
      </span>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>{t('partner-businesses-discounts')}</DialogTitle>
            <DialogClose className="ring-offset-background absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('business-name')}</TableHead>
                  <TableHead className="text-right">{t('discount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((business, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {business.link ? (
                        <a
                          href={business.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 transition-colors"
                        >
                          <span className="hover:underline">
                            {business.name}
                          </span>
                          <ArrowUpRight className="shrink-0 h-4 w-4 text-blue-600 transition-transform hover:text-blue-800 group-hover:-translate-y-1 group-hover:translate-x-1" />
                        </a>
                      ) : (
                        business.name
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {business.discount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BusinessDiscountModal
