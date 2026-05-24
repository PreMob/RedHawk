FROM node:20-bookworm-slim

ENV NODE_ENV=production \
    PNPM_HOME=/pnpm \
    VIRTUAL_ENV=/opt/venv \
    PYTHONUNBUFFERED=1 \
    PYTHON_BIN=python3
ENV PATH="$PNPM_HOME:$VIRTUAL_ENV/bin:$PATH"

WORKDIR /app/Backend

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates python3 python3-venv \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m venv "$VIRTUAL_ENV" \
    && corepack enable \
    && corepack prepare pnpm@10.11.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --no-frozen-lockfile

COPY AI/requirements.txt AI/requirements.txt
RUN pip install --no-cache-dir -r AI/requirements.txt

COPY . .

RUN mkdir -p /app/uploads

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
