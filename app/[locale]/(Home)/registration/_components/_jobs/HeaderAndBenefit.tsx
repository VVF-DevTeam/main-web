// Libraries
import React from 'react'

// Components
import { Separator } from '@/components/ui/separator'

// Main Component
const HeaderAndBenefit = () => {
  return (
    <div className="flex-col-center width-max-default gap-y-10 px-5 py-20 lg:gap-y-20">
    {/* Header */}
    <div className="flex-col-center">
      <h1 className="header-sub header-font-default mb-7 text-center text-textColor-brandDark lg:text-5xl">
        Volunteers
      </h1>
      <Separator className="w-[170%] bg-bgColor-brandDark" />
    </div>

    {/* Benefits */}
    <div className="flex-col-default">
      <p>
        We are looking for people who are willing to join our team as an
        officer or volunteer to help us in our mission to connect Vietnamese
        people in Vancouver through arts and cultures.
      </p>
      <p> When joining VVF, you will have the opportunity to:</p>
      <div className="ml-4">
        <ol className="list-decimal">
          <li>
            Gain experience in one of more fields of expertise that you are
            interested in
          </li>
          <li>Get recognized by receiving a certification from VVF</li>
          <li>
            Get access to multiple essential and modern technologies and
            applications for free such as:
            <ul className="list-inside list-disc">
              <li>
                A work Google account with our domain in it (ex:
                joe.smith@vietvibe.org)
              </li>
              <li>Access to all Google Workspace features</li>
              <li>
                Access to Microsoft 365 Basics feature (Words, Excel,
                PowerPoint, OneDrive, Teams, etc.)
              </li>
              <li>Access to Canvas Pros</li>
              <li>Access to Github Team</li>
              <li>15% discount from Lululemon</li>
              <li>
                Staff discount when join in any courses or events from VVF
              </li>
              <li>Access to ChatGPT Plus</li>
              <li>Participate in exciting events such as hiking, camping, board night game and more with us</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  </div>
  )
}

export default HeaderAndBenefit
