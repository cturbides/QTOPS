#!/bin/bash

echo "Ejecutando seeds (*.seed.ts)..."

find ./src/seed -name "*.seed.ts" | sort | while IFS= read -r file; do
  echo "Ejecutando: $file"
  npx ts-node -r tsconfig-paths/register "$file"
done
