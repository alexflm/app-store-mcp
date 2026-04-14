FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
COPY docs ./docs
RUN pnpm run build && \
    pnpm prune --prod

FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/docs ./docs
COPY --from=build /app/package.json ./

ENV MCP_TRANSPORT=httpStream
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

CMD ["dist/index.js"]
