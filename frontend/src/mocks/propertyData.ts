
export const mockProperties: any[] = [
  {
    tokenId: 1n,
    owner: "0x1234567890123456789012345678901234567890",
    cadastralNumber: "ABC123",
    location: "123 Blockchain Street, Crypto City",
    valuation: "150",
    active: true,
    lastUpdated: new Date(),
    metadata: {
      name: "Luxury Villa",
      description: "A beautiful luxury villa with ocean view",
      image: "/suburban-house-exterior.png",
      attributes: [
        { trait_type: "Bedrooms", value: "4" },
        { trait_type: "Bathrooms", value: "3" },
        { trait_type: "Square Feet", value: "2,500" },
        { trait_type: "Year Built", value: "2020" }
      ]
    }
  },
  {
    tokenId: 2n,
    owner: "0x2345678901234567890123456789012345678901",
    cadastralNumber: "DEF456",
    location: "456 DeFi Avenue, Token Town",
    valuation: "200",
    active: true,
    lastUpdated: new Date(),
    metadata: {
      name: "Modern Apartment",
      description: "Contemporary apartment in the heart of the city",
      image: "/suburban-house-exterior.png",
      attributes: [
        { trait_type: "Bedrooms", value: "2" },
        { trait_type: "Bathrooms", value: "2" },
        { trait_type: "Square Feet", value: "1,200" },
        { trait_type: "Year Built", value: "2022" }
      ]
    }
  }
] 