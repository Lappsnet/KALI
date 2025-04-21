export interface Sale {
  id: string
  propertyId: string
  title: string
  price: bigint
  buyer: string
  seller: string
  saleDate: string
  transactionHash: string
  status: 'pending' | 'completed' | 'cancelled'
  propertyImage?: string
  propertyLocation?: string
}

export const mockSales: Sale[] = [
  {
    id: "1",
    propertyId: "123",
    title: "Modern Downtown Apartment",
    price: BigInt("1000000000000000000"), // 1 ETH
    buyer: "0x123...abc",
    seller: "0x456...def",
    saleDate: "2024-03-15",
    transactionHash: "0x789...xyz",
    status: "completed",
    propertyImage: "/properties/apartment.jpg",
    propertyLocation: "123 Downtown St, Metropolis"
  },
  {
    id: "2",
    propertyId: "124",
    title: "Luxury Beachfront Villa",
    price: BigInt("5000000000000000000"), // 5 ETH
    buyer: "0x789...ghi",
    seller: "0x012...jkl",
    saleDate: "2024-03-10",
    transactionHash: "0x345...uvw",
    status: "completed",
    propertyImage: "/properties/villa.jpg",
    propertyLocation: "456 Beach Road, Coastal City"
  },
  {
    id: "3",
    propertyId: "125",
    title: "Historic Townhouse",
    price: BigInt("2500000000000000000"), // 2.5 ETH
    buyer: "0x456...def",
    seller: "0x789...ghi",
    saleDate: "2024-03-05",
    transactionHash: "0x678...rst",
    status: "completed",
    propertyImage: "/properties/townhouse.jpg",
    propertyLocation: "789 Heritage Ave, Old Town"
  },
  {
    id: "4",
    propertyId: "126",
    title: "Mountain View Cabin",
    price: BigInt("800000000000000000"), // 0.8 ETH
    buyer: "0x012...jkl",
    seller: "0x123...abc",
    saleDate: "2024-02-28",
    transactionHash: "0x901...mno",
    status: "completed",
    propertyImage: "/properties/cabin.jpg",
    propertyLocation: "321 Mountain Pass, Highland"
  },
  {
    id: "5",
    propertyId: "127",
    title: "Urban Loft Studio",
    price: BigInt("750000000000000000"), // 0.75 ETH
    buyer: "0x345...uvw",
    seller: "0x678...rst",
    saleDate: "2024-02-20",
    transactionHash: "0x234...pqr",
    status: "completed",
    propertyImage: "/properties/loft.jpg",
    propertyLocation: "567 Urban District, Metro City"
  },
  {
    id: "6",
    propertyId: "128",
    title: "Suburban Family Home",
    price: BigInt("3000000000000000000"), // 3 ETH
    buyer: "0x678...rst",
    seller: "0x901...mno",
    saleDate: "2024-02-15",
    transactionHash: "0x567...stu",
    status: "completed",
    propertyImage: "/properties/suburban.jpg",
    propertyLocation: "890 Maple Street, Suburbia"
  },
  {
    id: "7",
    propertyId: "129",
    title: "Waterfront Condo",
    price: BigInt("2000000000000000000"), // 2 ETH
    buyer: "0x901...mno",
    seller: "0x234...pqr",
    saleDate: "2024-02-10",
    transactionHash: "0x890...vwx",
    status: "completed",
    propertyImage: "/properties/condo.jpg",
    propertyLocation: "234 Harbor View, Marina Bay"
  },
  {
    id: "8",
    propertyId: "130",
    title: "Garden Apartment",
    price: BigInt("900000000000000000"), // 0.9 ETH
    buyer: "0x234...pqr",
    seller: "0x567...stu",
    saleDate: "2024-02-05",
    transactionHash: "0x123...yza",
    status: "completed",
    propertyImage: "/properties/garden.jpg",
    propertyLocation: "456 Garden Court, Green Valley"
  }
] 