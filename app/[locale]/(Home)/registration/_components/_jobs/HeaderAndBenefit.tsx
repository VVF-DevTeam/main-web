// Libraries
import React from 'react'
import initTranslations from '@/app/i18n'

// Components
import { Separator } from '@/components/ui/separator'

// Interface & Type
interface HeaderAndBenefitProps {
  locale: string
}

// Main Component
const HeaderAndBenefit = async ({locale}: HeaderAndBenefitProps) => {
  const { t } = await initTranslations(locale, ['job', 'common'])

  return (
    <div className="flex-col-center gap-y-10 px-5 py-20 lg:gap-y-20">
    {/* Header */}
    <div className="flex-col-center">
      <h1 className="header-sub mb-2 text-center text-textColor-brandDark900 lg:text-5xl">
        {t('header-benefits')}
      </h1>
      <Separator className="w-[120%] bg-bgColor-brandDark900" />
    </div>

    {/* Benefits */}
    <div className="flex-col-default">
      <p>
        {t('benefits-description1')}
      </p>
      <p> {t('benefits-description2')}</p>
      <div className="ml-4">
        <ol className="list-decimal">
          <li>
          {t('benefits-item1')}

          </li>
          <li>{t('benefits-item2')}</li>
          <li>
            {t('benefits-item3')}
            <ul className="list-inside list-disc">
              <li>
                {t('benefits-subitem1')}
              </li>
              <li>{t('benefits-subitem2')}</li>
              <li>
                {t('benefits-subitem3')}
              </li>
              <li>
                {t('benefits-subitemMore')}
              </li>
            </ul>
            
            {/* See More/Less Toggle */}
            <div className="mt-2">
              <input type="checkbox" id="see-more-benefits" className="hidden peer" />
              <div className="peer-checked:hidden">
                <label htmlFor="see-more-benefits" className="cursor-pointer text-textColor-blue hover:text-blue-800 underline text-sm">
                  {t('see-more')}
                </label>
              </div>
              <div className="hidden peer-checked:block">
                <label htmlFor="see-more-benefits" className="cursor-pointer text-textColor-blue hover:text-blue-800 underline text-sm">
                  {t('see-less')}
                </label>
              </div>
              
              <div className="hidden peer-checked:block mt-2">
                <ul className="list-inside list-disc ml-4">
                  <li>{t('benefits-subitem4')}</li>
                  <li>{t('benefits-subitem5')}</li>
                  <li>{t('benefits-subitem6')}</li>
                  <li>
                  {t('benefits-subitem7')}
                  </li>
                  <li>{t('benefits-subitem8')}</li>
                  <li>{t('benefits-subitem9')}</li>
                </ul>
              </div>
            </div>
          </li>
        </ol>
      </div>
      <p className='text-xs italic'>{t('job-note')}</p>
    </div>
  </div>
  )
}

export default HeaderAndBenefit
