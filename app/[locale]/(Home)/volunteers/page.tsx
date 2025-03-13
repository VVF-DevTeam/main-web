// Components
import { Separator } from '@/components/ui/separator'

const Volunteers = () => {
  return (
    <div className="flex-col-center width-max-default gap-y-10 px-5 py-20 lg:gap-y-20">
      {/* Header */}
      <div className="flex-col-center">
        <h1 className="header-sub header-font-default mb-7 text-center text-textColor-brandDark lg:text-5xl">
          Volunteers
        </h1>
        <Separator className="w-[170%] bg-bgColor-brandDark" />
      </div>
      <p>
        We are looking for people who are willing to join our team as an officer
        or volunteer to help us in our mission to connect Vietnamese people in
        Vancouver through arts and cultures.
      </p>
      <p> When joining VVF, you will have the opportunity to:</p>
      <p>When you become a volunteer in VVF, you will be able to:</p>
      <ul className="list-inside list-disc">
        <li>
          Gain experience in one of more fields of expertise that you are
          interested in
        </li>
        <li>Get recognized by receiving a certification from VVF</li>
        <li>
          Get access to multiple essential and modern technologies and
          applications for free such as:
          <ol className="list-decimal">
            <li>A work Google account with our domain in it (joe.smith@vietvibe.org)</li>
            <li>Free access to </li>
            <li>Google Sheets</li>
            <li>Google Slides</li>
          </ol>
        </li>
      </ul>
    </div>
  )
}

export default Volunteers
