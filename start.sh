set -e

git pull 
npm install
npm run build
docker cp dist my-nginx:/home/dev/code/landing/