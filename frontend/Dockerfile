FROM node:18

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# Serve the build with a simple static server
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]