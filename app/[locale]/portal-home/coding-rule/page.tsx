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
          5) Next.js route & pathname naming
        </h3>
        <p className="text-sm text-textColor-gray100">
          In the App Router, <strong>folder names</strong> are URL segments unless the folder is
          special-cased. Follow these naming rules for pathnames:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-textColor-gray100">
          <li>
            <strong>URL segments (folders):</strong> use <strong>kebab-case</strong> — lowercase
            words with hyphens (e.g. <code>portal-home</code>, <code>coding-rule</code>,
            <code>create-event</code>). Avoid camelCase or spaces in segment names.
          </li>
          <li>
            <strong>Dynamic segments:</strong> bracket folder names — <code>[locale]</code>,{' '}
            <code>[eventKeyName]</code>. Param names are camelCase by convention; they appear in{' '}
            <code>params</code> on <code>page.tsx</code> / <code>layout.tsx</code>.
          </li>
          <li>
            <strong>Route groups:</strong> parentheses — <code>(Home)</code>, <code>(auth)</code>.
            The group name is <strong>not</strong> part of the URL; it only groups layouts.
          </li>
          <li>
            <strong>Private folders (underscore):</strong> a segment whose name starts with{' '}
            <code>_</code> — for example <code>_components</code>, <code>_lib</code> — is{' '}
            <strong>not</strong> part of the URL. Use these to colocate components, hooks, or tests
            next to a route without adding another pathname segment. (Same idea as route groups, but
            marked explicitly as implementation-only.)
          </li>
          <li>
            <strong>Reserved file names:</strong> <code>page.tsx</code> (route UI),{' '}
            <code>layout.tsx</code> (nested layout), <code>loading.tsx</code>,{' '}
            <code>error.tsx</code>, <code>route.ts</code> (Route Handler). File name is fixed;
            only the folder path becomes the pathname.
          </li>
          <li>
            <strong>Catch-all / optional catch-all:</strong> <code>[...slug]</code>,{' '}
            <code>[[...slug]]</code> — use when one segment must capture multiple path parts.
          </li>
        </ul>
        <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-textColor-gray100">
{`app/[locale]/portal-home/page.tsx
  -> URL path: /{locale}/portal-home

app/[locale]/portal-home/coding-rule/page.tsx
  -> URL path: /{locale}/portal-home/coding-rule

app/[locale]/(Home)/events/page.tsx
  -> URL path: /{locale}/events   // (Home) is omitted from the pathname

app/[locale]/(Home)/profile/_components/Foo.tsx
  -> _components does not appear in the URL; still /{locale}/profile/...

On portal.vietvibe.org, middleware rewrites short URLs to portal-home internally:
  /{locale}  ->  /{locale}/portal-home
  /{locale}/coding-rule  ->  /{locale}/portal-home/coding-rule`}
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
