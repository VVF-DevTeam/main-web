import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portal Coding Rules',
  description: 'Internal coding rules for portal development',
}

export default function PortalCodingRulePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-textColor-white">Portal Coding Rules</h2>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-textColor-secondary600">
          1) Use shared color system
        </h3>
        <p className="text-sm text-textColor-gray100">
          Always use colors from <code>lib/ui/css/globals.css</code> and{' '}
          <code>tailwind.config.ts</code> instead of hardcoded hex values.
        </p>
        <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-textColor-gray100">
{`// Good examples
<div className="bg-bgColor-brand900 text-textColor-white" />
<p className="text-textColor-secondary600" />
<button className="bg-bgColor-gray500 hover:bg-bgColor-black/80" />`}
        </pre>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-textColor-secondary600">
          2) Reuse existing components in /components
        </h3>
        <p className="text-sm text-textColor-gray100">
          Reuse design system components (for example <code>components/ui/button.tsx</code>)
          and follow existing usage patterns in current pages before creating new UI primitives.
        </p>
        <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-textColor-gray100">
{`import { Button } from '@/components/ui/button'

<Button variant="default">Save</Button>
<Button variant="outline">Cancel</Button>`}
        </pre>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-textColor-secondary600">
          3) Prefer existing functions in /lib (especially /lib/actions)
        </h3>
        <p className="text-sm text-textColor-gray100">
          Before writing new business logic, check existing actions and reuse them when possible.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-textColor-gray100">
          <li>
            <code>lib/actions/event/getEvent.ts</code> - event query helpers
          </li>
          <li>
            <code>lib/actions/review/reviewActions.ts</code> - review CRUD and queries
          </li>
          <li>
            <code>lib/actions/user/getAllUsersSimple.ts</code> - user list helpers
          </li>
          <li>
            <code>lib/actions/payment/linkGuestPayments.ts</code> - payment/user linking
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-textColor-secondary600">
          4) Database changes must follow Prisma workflow
        </h3>
        <p className="text-sm text-textColor-gray100">
          To add or update database models, edit <code>prisma/schema.prisma</code> and then run
          migration immediately:
        </p>
        <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-textColor-gray100">
{`npx prisma migrate dev`}
        </pre>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-textColor-secondary600">
          5) Next.js route convention
        </h3>
        <p className="text-sm text-textColor-gray100">
          In App Router, folders define URL paths. For example:
        </p>
        <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-textColor-gray100">
{`app/[locale]/portal-home/page.tsx       -> filesystem: /{locale}/portal-home
On portal.vietvibe.org, middleware shows short URLs: /{locale} and /{locale}/coding-rule`}
        </pre>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-textColor-secondary600">
          6) No localization required for portal pages
        </h3>
        <p className="text-sm text-textColor-gray100">
          For portal features, localization is not required. Keep content in one language unless
          explicitly requested.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-textColor-secondary600">
          7) Use Prisma cache + revalidation pattern
        </h3>
        <p className="text-sm text-textColor-gray100">
          Read <code>documentation/CACHE_REVALIDATION_DOCUMENTATION.md</code> and follow existing{' '}
          <code>unstable_cache</code>, tag, and invalidation patterns (for example events tag
          revalidation) when building new data queries.
        </p>
      </section>
    </div>
  )
}
