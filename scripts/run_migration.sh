#!/bin/bash

# Get the current directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Set the path to the configuration file
CONFIG_FILE="$SCRIPT_DIR/../src/config/config.js"

# Prompt for the NODE_ENV
echo "Please enter the environment (e.g., development, production):"
read environment

# Prompt for the migration file name
echo "Please enter the migration file name (e.g., 20240706053012-rename-category-table.js):"
read migration_name

# Check if the migration file exists
MIGRATION_FILE="$SCRIPT_DIR/../src/migrations/$migration_name"
if [[ ! -f "$MIGRATION_FILE" ]]; then
  echo "Migration file $migration_name does not exist. Please check the file name and try again."
  exit 1
fi

# Log the current environment and database configuration
echo "Running in ${environment} mode"
echo "Using configuration file: ${CONFIG_FILE}"

# Set the NODE_ENV and run the migration with the specified config file
NODE_ENV=$environment DEBUG=sequelize:*,pg npx sequelize-cli db:migrate --name "$migration_name" --config "$CONFIG_FILE"
