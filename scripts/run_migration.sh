#!/bin/bash

# COMMAND TO RUN THIS MIGRATION
# npm run migrate -- development 20240706053012-rename-category-table.js

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <environment> <migration_name>"
  exit 1
fi

# Get the arguments
environment=$1
migration_name=$2

# Get the current directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Set the path to the configuration file
CONFIG_FILE="$SCRIPT_DIR/../src/config/config.js"

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
