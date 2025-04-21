export interface Property {
  id: number;
  tokenId: number;
  cadastralNumber: string;
  location: string;
  valuation: string;
  status: 'active' | 'inactive';
  metadataURI: string;
  owner: string;
  imageUrl: string;
}

export interface PropertySale {
  saleId: number;
  propertyId: number;
  seller: string;
  buyer: string | null;
  price: string;
  notary: string | null;
  status: 'created' | 'pending' | 'approved' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
  saleDocumentURI: string;
  rentableTokensIncluded: boolean;
  rentableTokenAmount: string;
}

export interface RentableToken {
  id: number;
  balance: string;
  yieldRate: number;
  lastYieldTime: number;
  accumulatedYield: string;
}

export interface PropertyDocument {
  id: number;
  propertyId: number;
  documentType: 'deed' | 'title' | 'survey' | 'inspection' | 'other';
  documentURI: string;
  timestamp: number;
  verifiedBy: string | null;
}

// Mock data
export const mockProperties: Property[] = [
  {
    id: 1,
    tokenId: 1,
    cadastralNumber: "ES-SV-LL-001",
    location: "Santa Tecla, La Libertad, El Salvador",
    valuation: "100000000000000000000",
    status: "active",
    metadataURI: "ipfs://QmExample1",
    owner: "0x1234567890123456789012345678901234567890",
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800",
  },
  {
    id: 2,
    tokenId: 2,
    cadastralNumber: "ES-SV-LL-002",
    location: "San Salvador, El Salvador",
    valuation: "150000000000000000000",
    status: "active",
    metadataURI: "ipfs://QmExample2",
    owner: "0x2345678901234567890123456789012345678901",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800",
  },
  {
    id: 3,
    tokenId: 3,
    cadastralNumber: "ES-SV-LL-003",
    location: "La Libertad, El Salvador",
    valuation: "75000000000000000000",
    status: "active",
    metadataURI: "ipfs://QmExample3",
    owner: "0x3456789012345678901234567890123456789012",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800",
  },
];

export const mockSales: PropertySale[] = [
  {
    saleId: 1,
    propertyId: 1,
    seller: "0x1234567890123456789012345678901234567890",
    buyer: null,
    price: "120000000000000000000",
    notary: null,
    status: "created",
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    completedAt: null,
    saleDocumentURI: "ipfs://QmSaleDoc1",
    rentableTokensIncluded: true,
    rentableTokenAmount: "1000000000000000000",
  },
  {
    saleId: 2,
    propertyId: 2,
    seller: "0x2345678901234567890123456789012345678901",
    buyer: "0x4567890123456789012345678901234567890123",
    price: "180000000000000000000",
    notary: "0x5678901234567890123456789012345678901234",
    status: "approved",
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 86400000,
    completedAt: null,
    saleDocumentURI: "ipfs://QmSaleDoc2",
    rentableTokensIncluded: false,
    rentableTokenAmount: "0",
  },
  {
    saleId: 3,
    propertyId: 3,
    seller: "0x3456789012345678901234567890123456789012",
    buyer: "0x6789012345678901234567890123456789012345",
    price: "90000000000000000000",
    notary: "0x5678901234567890123456789012345678901234",
    status: "completed",
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 86400000,
    completedAt: Date.now() - 86400000,
    saleDocumentURI: "ipfs://QmSaleDoc3",
    rentableTokensIncluded: true,
    rentableTokenAmount: "500000000000000000",
  },
];

export const mockRentableTokens: RentableToken[] = [
  {
    id: 1,
    balance: "1000000000000000000",
    yieldRate: 500,
    lastYieldTime: Date.now() - 86400000,
    accumulatedYield: "50000000000000000",
  },
  {
    id: 2,
    balance: "2000000000000000000",
    yieldRate: 500,
    lastYieldTime: Date.now() - 172800000,
    accumulatedYield: "150000000000000000",
  },
  {
    id: 3,
    balance: "500000000000000000",
    yieldRate: 500,
    lastYieldTime: Date.now() - 259200000,
    accumulatedYield: "100000000000000000",
  },
];

export const mockDocuments: PropertyDocument[] = [
  {
    id: 1,
    propertyId: 1,
    documentType: "deed",
    documentURI: "ipfs://QmDeed1",
    timestamp: Date.now() - 86400000,
    verifiedBy: "0x5678901234567890123456789012345678901234",
  },
  {
    id: 2,
    propertyId: 1,
    documentType: "title",
    documentURI: "ipfs://QmTitle1",
    timestamp: Date.now() - 172800000,
    verifiedBy: "0x5678901234567890123456789012345678901234",
  },
  {
    id: 3,
    propertyId: 2,
    documentType: "survey",
    documentURI: "ipfs://QmSurvey2",
    timestamp: Date.now() - 259200000,
    verifiedBy: null,
  },
]; 