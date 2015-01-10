tsc server.ts --watch --target "ES5" --module "commonjs" &
tsc scripts/script.ts --watch --target "ES5" --removeComments --out scripts/script.js &
tsc scripts/filterWorker.ts --watch --target "ES5" --removeComments --out scripts/filterWorker.js &
node server.js &