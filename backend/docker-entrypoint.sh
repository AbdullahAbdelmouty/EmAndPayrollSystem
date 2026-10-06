set -e

echo "Running migrations..."
node ./node_modules/typeorm/cli.js migration:run -d dist/database/data-source.js

if [ "$SEED_ON_START" = "true" ]; then
  echo "Seeding demo data..."
  node dist/database/seeds/seed.js
fi

exec node dist/main.js