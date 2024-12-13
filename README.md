This is a [Next.js](https://nextjs.org) project to create a web application template for Viet Vibe Foundation (VVF) non-profit organization.

## Getting Started

1. Run the development server:

   ```sh
   npm install --global yarn
   yarn dev
   ```

   or

   ```sh
   npm i
   npm run dev
   ```

2. Local Development: 

   Open http://localhost:3000 in your browser to see the template home page. You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

   This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

3. Deployment:

   This project uses AWS Amplify and Vercel to host the production and dev branches:
   - Amplify: https://dev.d2stxy8cy8jezo.amplifyapp.com/events
   - Vercel: https://main-web-drab.vercel.app/
  
   In addition, the branch is integrated with Vercel bot to build every PR: ![image](https://github.com/user-attachments/assets/8b237405-8d22-4aaf-8ab3-9ef1ada254de)

# Learn More
This template is written in [Next.js](https://nextjs.org/docs) 13 using the [Next.js App Router](https://nextjs.org/docs/app).

To learn more about Next.js, see:

- [Next.js documentation](https://nextjs.org/docs): Learn about Next.js features and APIs.
- [Learn Next.js](https://nextjs.org/learn): An interactive Next.js tutorial.

Additionally, this template uses the following libraries and features:

- [React Server Components](https://nextjs.org/docs/advanced-features/react-18/server-components)
- [TypeScript](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
- [TanStack Query v4](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
