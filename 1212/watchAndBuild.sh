tsc server.ts --watch --target "ES5" --module "commonjs" &
tsc script.ts --watch --target "ES5" --removeComments --out script.js &
tsc filterWorker.ts --watch --target "ES5" --removeComments --out filterWorker.js &
node server.js &