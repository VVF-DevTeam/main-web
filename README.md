This is a [Next.js](https://nextjs.org) project to create a web application template for Viet Vibe Foundation (VVF) non-profit organization.

## Getting Started

1. Packages installment (we will mainly use yarn for packages management):

   ```sh
   npm install --global yarn
   yarn install --immutable
   yarn dev
   ```

2. Development:

   a. Add all the environment variables from this [document](https://docs.google.com/spreadsheets/d/1HWzT14xOBQg8zwtJ3RfTpdCH8ENshvoSRAO7LeGP1IM/edit?usp=sharing) to the '.env' file before starting local development (only accessible to officers who have VVF gmail account)
   
   b. Open http://localhost:3000 in your browser to see the template home page. Then navigate to the page mentioned in your tasks and start editing. The website is auto-updated as you edit the file and make new changes.
   
   c. For the database, run the following command to open local database studio (ensure DATABASE_URL is in .env, refer to this [document](https://docs.google.com/spreadsheets/d/1HWzT14xOBQg8zwtJ3RfTpdCH8ENshvoSRAO7LeGP1IM/edit?usp=sharing)):
    ```sh
   npx prisma studio
   ```
   d. Before pushing the code, __always__ remember to run the build command below (some errors only show as warning in development mode but will cause build to fail):
   ```sh
   yarn run build
   ```
   e. *__Some important tips:__*
      - When you add/modify **any** packages in package.json, please update yarn.lock by running:

         ```sh
         yarn install --mode=update-lockfile
         ```
4. Pull Request & Deployment:

   a. This project uses AWS Amplify and Vercel to host the production and dev branches:
      - Amplify: www.vietvibe.org
      - Vercel: https://main-web-git-dev-khaihung-vvfs-projects.vercel.app 
  
   b. In addition, the branch is integrated with Vercel and Amplify bots to build every PR's preview automatically. Please __always verify__ your PR after the build is finished:
      - For Vercel, you will need a Vercel account to request access to the preview:
   ![image](https://github.com/user-attachments/assets/8b237405-8d22-4aaf-8ab3-9ef1ada254de)
      - For AWS, it is open to the public:
   ![image](https://github.com/user-attachments/assets/03c59fb7-dcf2-4608-a1ff-c9373b2a2a84)

   c. *__Some important tips:__* :
      - Make sure __all__ checks have passed in your PR: 
      ![image](https://github.com/user-attachments/assets/30f67fa3-b284-4576-a23e-268f52368cc3)
      - __Always__ check and test your code in the preview of at least one of the builds of Amplify and Vercel (preferably Amplify because we host our main web there)

 5. Conventions & Wiki:
   - There are conventions and rules about coding we need to follow to ensure our project's efficiency and cleanliness
   - Please *__thoroughly read__* through the [Wiki](https://github.com/Viet-Vibe-Foundation/main-web/wiki)
   - You can also visit [our repo Deep Wiki](https://deepwiki.com/Viet-Vibe-Foundation/main-web) 
    
# Learn More
This template is written in [Next.js](https://nextjs.org/docs) 15 using the [Next.js App Router](https://nextjs.org/docs/app).

To learn more about Next.js, see:

- [Next.js documentation](https://nextjs.org/docs): Learn about Next.js features and APIs.
- [Learn Next.js](https://nextjs.org/learn): An interactive Next.js tutorial (Choose App Router).

Additionally, this template uses the following libraries and features:

- [React Server Components](https://nextjs.org/docs/advanced-features/react-18/server-components)
- [TypeScript](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
