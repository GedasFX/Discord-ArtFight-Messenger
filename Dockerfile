FROM node:lts

WORKDIR /app

RUN apt-get update && apt-get install -y \
    xvfb \
    libnss3 \
    libxss1 \
    libasound2 \
    libgtk-3-0 \
    libgbm-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV DISPLAY=:99

COPY package*.json ./

RUN npm install
RUN npx playwright install chrome

COPY . .

USER 1890

ENTRYPOINT ["./entrypoint.sh"]