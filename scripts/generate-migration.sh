#!/bin/bash

# Check if the migration name argument is provided
if [ -z "$1" ]; then
  echo "Error: Migration name is required."
  echo "Usage: $0 <migration_name>"
  exit 1
fi

# Set the migration name
MIGRATION_NAME=$1

# Run the sequelize-cli command to generate the migration
npx sequelize-cli migration:generate --name "$MIGRATION_NAME"

# Check if the command was successful
if [ $? -eq 0 ]; then
  echo "Migration '$MIGRATION_NAME' generated successfully."
else
  echo "Failed to generate migration '$MIGRATION_NAME'."
  exit 1
fi
