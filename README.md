This is a [Next.js](https://nextjs.org) project to create a web application template for Viet Vibe Foundation (VVF) non-profit organization.

## Getting Started

1. Run the development server:

   ```sh
   npm install --global yarn
   yarn install --immutable
   yarn dev
   ```

2. Local Development: 

   Open http://localhost:3000 in your browser to see the template home page. You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

   *__Some important tips:__*
      - Remember to add all the environment variables in this [document](https://docs.google.com/spreadsheets/d/1HWzT14xOBQg8zwtJ3RfTpdCH8ENshvoSRAO7LeGP1IM/edit?usp=sharing) (only accessible for officers who have VVF gmail account) 
      - When you added/modified **any** packages in package.json, please update yarn.lock by running:

         ```sh
         yarn install --mode=update-lockfile
         ```
      - Make sure all checks pass in your PR: 
         ![image](https://github.com/user-attachments/assets/30f67fa3-b284-4576-a23e-268f52368cc3)

4. Deployment:

   This project uses AWS Amplify and Vercel to host the production and dev branches:
   - Amplify: www.vietvibe.org
   - Vercel: https://main-web-git-dev-khaihung-vvfs-projects.vercel.app
  
   In addition, the branch is integrated with Vercel and Amplify bot to build every PR's preview automatically: 
   ![image](https://github.com/user-attachments/assets/8b237405-8d22-4aaf-8ab3-9ef1ada254de)
   ![image](https://github.com/user-attachments/assets/03c59fb7-dcf2-4608-a1ff-c9373b2a2a84)


# Learn More
This template is written in [Next.js](https://nextjs.org/docs) 15 using the [Next.js App Router](https://nextjs.org/docs/app).

To learn more about Next.js, see:

- [Next.js documentation](https://nextjs.org/docs): Learn about Next.js features and APIs.
- [Learn Next.js](https://nextjs.org/learn): An interactive Next.js tutorial.

Additionally, this template uses the following libraries and features:

- [React Server Components](https://nextjs.org/docs/advanced-features/react-18/server-components)
- [TypeScript](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
