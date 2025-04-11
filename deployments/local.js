const fs = require("fs");
const path = require("path");

const deployments = {
  RealEstateERC721: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  RentableToken: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  FractionalOwnership: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  RealEstateSale: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  LendingProtocol: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  RentalAgreement: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  MarketplaceOrchestrator: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  MintedPropertyId: 1
};

const outputDir = path.join(__dirname, "..", "deployments");
const outputFile = path.join(outputDir, "local.json");

// Ensure the deployments directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Write the JSON file
fs.writeFileSync(outputFile, JSON.stringify(deployments, null, 2));

console.log(`✅ Deployment info saved to ${outputFile}`);
