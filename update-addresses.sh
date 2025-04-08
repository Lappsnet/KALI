#!/bin/bash

# This script updates the contract addresses in the frontend code
# Run this after deploying your contracts to Anvil

# Usage: ./update-addresses.sh <deployment-file.json>

if [ -z "$1" ]; then
  echo "Usage: ./update-addresses.sh <deployment-file.json>"
  exit 1
fi

DEPLOYMENT_FILE=$1
CONTRACTS_FILE="frontend/src/utils/contracts.ts"

# Check if deployment file exists
if [ ! -f "$DEPLOYMENT_FILE" ]; then
  echo "Deployment file not found: $DEPLOYMENT_FILE"
  exit 1
fi

# Check if contracts file exists
if [ ! -f "$CONTRACTS_FILE" ]; then
  echo "Contracts file not found: $CONTRACTS_FILE"
  exit 1
fi

# Extract addresses from deployment file
echo "Extracting addresses from $DEPLOYMENT_FILE..."

# Create a temporary file with updated addresses
cat "$CONTRACTS_FILE" | sed -E "s/(RealEstateERC721: )'[^']*'/\1'$(jq -r '.RealEstateERC721' $DEPLOYMENT_FILE)'/g" \
  | sed -E "s/(RentableToken: )'[^']*'/\1'$(jq -r '.RentableToken' $DEPLOYMENT_FILE)'/g" \
  | sed -E "s/(FractionalOwnership: )'[^']*'/\1'$(jq -r '.FractionalOwnership' $DEPLOYMENT_FILE)'/g" \
  | sed -E "s/(RealEstateSale: )'[^']*'/\1'$(jq -r '.RealEstateSale' $DEPLOYMENT_FILE)'/g" \
  | sed -E "s/(LendingProtocol: )'[^']*'/\1'$(jq -r '.LendingProtocol' $DEPLOYMENT_FILE)'/g" \
  | sed -E "s/(RentalAgreement: )'[^']*'/\1'$(jq -r '.RentalAgreement' $DEPLOYMENT_FILE)'/g" \
  | sed -E "s/(MarketplaceOrchestrator: )'[^']*'/\1'$(jq -r '.MarketplaceOrchestrator' $DEPLOYMENT_FILE)'/g" > temp_contracts.ts

# Replace the original file
mv temp_contracts.ts "$CONTRACTS_FILE"

echo "Contract addresses updated successfully!"
# Make it executable
chmod +x update-addresses.sh