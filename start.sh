set -e

git pull 
npm install
npm run build
docker cp dist nginx:/home/dev/code/landing/