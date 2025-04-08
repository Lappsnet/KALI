# Extract ABIs from Foundry output
for contract in RealEstateERC721 RentableToken FractionalOwnership RealEstateSale LendingProtocol RentalAgreement MarketplaceOrchestrator; do
  echo "Extracting ABI for $contract..."
  # Check if the contract JSON exists
  if [ -f "out/$contract.sol/$contract.json" ]; then
    jq .abi "out/$contract.sol/$contract.json" > "frontend/src/abis/$contract.json"
    echo "✅ Extracted ABI for $contract"
  else
    echo "❌ Could not find compiled contract for $contract"
    echo "Make sure you've compiled your contracts with 'forge build'"
  fi
done

echo "ABIs extracted to frontend/src/abis/"

chmod +x extract-abis.sh
