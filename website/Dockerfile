FROM node:current-alpine3.19 as base
# FROM node:current-alpine3.19

# 1. Install dependencies only when needed
FROM base AS deps
WORKDIR /app
# npm update
RUN npm install -g npm@latest
# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm i --legacy-peer-deps


# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copying prisma source files
COPY . .
COPY ../prisma .
# prisma schema to update the generated Prisma Client code 
RUN npx prisma generate 
# This will do the trick, use the corresponding env file for each environment.
COPY .env .env
#RUN yarn build
RUN cat next.config.js
RUN ls -alh
RUN npm run build
# RUN ls /app/.next -alh

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
#environment variable
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# ENV PORT 3000
# ENV SERVER_HOST='http://10.0.0.105:3000'
# ENV DATABASE_URL=mysql://root:password@10.0.0.105:3306/school?parseTime=true

CMD ["node", "server.js"]