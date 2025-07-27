#!/bin/bash

echo "Ejecutando seeds (*.seed.ts)..."

for file in $(find ./src -name "*.seed.ts"); do
  echo "Ejecutando: $file"
  npx ts-node -r tsconfig-paths/register "$file"
done
