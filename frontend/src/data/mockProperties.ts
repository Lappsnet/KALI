export interface MockProperty {
  tokenId: bigint
  cadastralNumber: string
  location: string
  valuation: string
  valuationRaw: bigint
  active: boolean
  lastUpdated: Date
  metadataURI: string
  owner: string
  metadata: {
    name: string
    description: string
    image: string
    attributes: Array<{
      trait_type: string
      value: string | number
    }>
  }
  hasActiveSale: boolean
}

export const mockProperties: MockProperty[] = [
  {
    tokenId: BigInt(1),
    cadastralNumber: "ES-SV-LL-001",
    location: "Santa Tecla, La Libertad, El Salvador",
    valuation: "2.5",
    valuationRaw: BigInt("2500000000000000000"), // 2.5 ETH in wei
    active: true,
    lastUpdated: new Date(),
    metadataURI: "ipfs://QmExample1",
    owner: "0x0000000000000000000000000000000000000000",
    metadata: {
      name: "Modern Townhouse Complex",
      description: "Beautiful modern townhouse complex with private parking and landscaped gardens. Each unit features contemporary design with black-framed windows and white exterior.",
      image: "/properties/townhouse-complex.jpg",
      attributes: [
        { trait_type: "Property Type", value: "Townhouse" },
        { trait_type: "Bedrooms", value: 3 },
        { trait_type: "Bathrooms", value: 2.5 },
        { trait_type: "Parking", value: "Private Garage" },
        { trait_type: "Year Built", value: 2024 }
      ]
    },
    hasActiveSale: true
  },
  {
    tokenId: BigInt(2),
    cadastralNumber: "ES-SV-LL-002",
    location: "Santa Elena, La Libertad, El Salvador",
    valuation: "4.8",
    valuationRaw: BigInt("4800000000000000000"), // 4.8 ETH in wei
    active: true,
    lastUpdated: new Date(),
    metadataURI: "ipfs://QmExample2",
    owner: "0x0000000000000000000000000000000000000000",
    metadata: {
      name: "Luxury Apartment Complex",
      description: "Premium apartment complex with gated entrance, central courtyard, and modern amenities. Features Mediterranean-style architecture with terracotta roofing.",
      image: "/properties/apartment-complex.jpg",
      attributes: [
        { trait_type: "Property Type", value: "Apartment Complex" },
        { trait_type: "Units", value: 24 },
        { trait_type: "Amenities", value: "Gated Community, Central Courtyard" },
        { trait_type: "Parking", value: "Reserved Parking" },
        { trait_type: "Year Built", value: 2024 }
      ]
    },
    hasActiveSale: true
  },
  {
    tokenId: BigInt(3),
    cadastralNumber: "ES-SV-LL-003",
    location: "Antiguo Cuscatlán, La Libertad, El Salvador",
    valuation: "3.9",
    valuationRaw: BigInt("3900000000000000000"), // 3.9 ETH in wei
    active: true,
    lastUpdated: new Date(),
    metadataURI: "ipfs://QmExample3",
    owner: "0x0000000000000000000000000000000000000000",
    metadata: {
      name: "Contemporary Villa",
      description: "Ultra-modern villa with striking architectural design. Features wood accents, floor-to-ceiling windows, and a minimalist aesthetic with covered parking.",
      image: "/properties/modern-villa.jpg",
      attributes: [
        { trait_type: "Property Type", value: "Villa" },
        { trait_type: "Bedrooms", value: 4 },
        { trait_type: "Bathrooms", value: 3.5 },
        { trait_type: "Parking", value: "Covered Carport" },
        { trait_type: "Year Built", value: 2024 }
      ]
    },
    hasActiveSale: true
  },
  {
    tokenId: BigInt(4),
    cadastralNumber: "ES-SV-LL-004",
    location: "San Salvador, El Salvador",
    valuation: "3.2",
    valuationRaw: BigInt("3200000000000000000"), // 3.2 ETH in wei
    active: true,
    lastUpdated: new Date(),
    metadataURI: "ipfs://QmExample4",
    owner: "0x0000000000000000000000000000000000000000",
    metadata: {
      name: "Urban Apartment Complex",
      description: "Modern apartment complex with vibrant design elements. Features secure parking, community areas, and contemporary architecture with accent colors.",
      image: "/properties/urban-apartments.jpg",
      attributes: [
        { trait_type: "Property Type", value: "Apartment Complex" },
        { trait_type: "Units", value: 32 },
        { trait_type: "Amenities", value: "Secure Parking, Community Areas" },
        { trait_type: "Style", value: "Contemporary Urban" },
        { trait_type: "Year Built", value: 2024 }
      ]
    },
    hasActiveSale: true
  }
]; 