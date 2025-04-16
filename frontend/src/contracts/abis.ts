// Real Estate ERC721 ABI
export const RealEstateERC721ABI = [
    {
      type: "constructor",
      inputs: [
        {
          name: "name_",
          type: "string",
          internalType: "string",
        },
        {
          name: "symbol_",
          type: "string",
          internalType: "string",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "addAdministrator",
      inputs: [
        {
          name: "admin",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "administrators",
      inputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "approve",
      inputs: [
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "balanceOf",
      inputs: [
        {
          name: "account",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getAllTokenIds",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256[]",
          internalType: "uint256[]",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getApproved",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getPropertyDetails",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "tuple",
          internalType: "struct RealEstateERC721.PropertyDetails",
          components: [
            {
              name: "cadastralNumber",
              type: "string",
              internalType: "string",
            },
            {
              name: "location",
              type: "string",
              internalType: "string",
            },
            {
              name: "valuation",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "active",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "lastUpdated",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "metadataURI",
              type: "string",
              internalType: "string",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getTokenIdByCadastralNumber",
      inputs: [
        {
          name: "_cadastralNumber",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "isApprovedForAll",
      inputs: [
        {
          name: "tokenOwner",
          type: "address",
          internalType: "address",
        },
        {
          name: "operator",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "mintProperty",
      inputs: [
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
        {
          name: "_cadastralNumber",
          type: "string",
          internalType: "string",
        },
        {
          name: "_location",
          type: "string",
          internalType: "string",
        },
        {
          name: "_valuation",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "_metadataURI",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "name",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "string",
          internalType: "string",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "owner",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "ownerOf",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "propertyDetails",
      inputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "cadastralNumber",
          type: "string",
          internalType: "string",
        },
        {
          name: "location",
          type: "string",
          internalType: "string",
        },
        {
          name: "valuation",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "active",
          type: "bool",
          internalType: "bool",
        },
        {
          name: "lastUpdated",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "metadataURI",
          type: "string",
          internalType: "string",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "removeAdministrator",
      inputs: [
        {
          name: "admin",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "safeTransferFrom",
      inputs: [
        {
          name: "from",
          type: "address",
          internalType: "address",
        },
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "safeTransferFrom",
      inputs: [
        {
          name: "from",
          type: "address",
          internalType: "address",
        },
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "data",
          type: "bytes",
          internalType: "bytes",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setApprovalForAll",
      inputs: [
        {
          name: "operator",
          type: "address",
          internalType: "address",
        },
        {
          name: "approved",
          type: "bool",
          internalType: "bool",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setPropertyMetadataURI",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "metadataURI",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setPropertyStatus",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "active",
          type: "bool",
          internalType: "bool",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "symbol",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "string",
          internalType: "string",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "tokenURI",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "string",
          internalType: "string",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "transferFrom",
      inputs: [
        {
          name: "from",
          type: "address",
          internalType: "address",
        },
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "transferOwnership",
      inputs: [
        {
          name: "newOwner",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "updatePropertyLocation",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "newLocation",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "updatePropertyValuation",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "newValuation",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "event",
      name: "AdministratorAdded",
      inputs: [
        {
          name: "admin",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "AdministratorRemoved",
      inputs: [
        {
          name: "admin",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "Approval",
      inputs: [
        {
          name: "owner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "approved",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "tokenId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "ApprovalForAll",
      inputs: [
        {
          name: "owner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "operator",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "approved",
          type: "bool",
          indexed: false,
          internalType: "bool",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "PropertyMetadataUpdated",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "metadataURI",
          type: "string",
          indexed: false,
          internalType: "string",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "PropertyMinted",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "cadastralNumber",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        {
          name: "owner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "PropertyStatusChanged",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "active",
          type: "bool",
          indexed: false,
          internalType: "bool",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "PropertyUpdated",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "field",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        {
          name: "value",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "Transfer",
      inputs: [
        {
          name: "from",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "to",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "tokenId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
  ] as const
  
  // Real Estate Sale ABI
  export const RealEstateSaleABI = [
    {
      type: "constructor",
      inputs: [
        {
          name: "_propertyToken",
          type: "address",
          internalType: "address",
        },
        {
          name: "_rentableToken",
          type: "address",
          internalType: "address",
        },
        {
          name: "_platformFeePercentage",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "_feeCollector",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "receive",
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "approveSale",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "assignNotary",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "authorizeNotary",
      inputs: [
        {
          name: "notary",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "authorizedNotaries",
      inputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "cancelSale",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "reason",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "completeSale",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "configureRentableTokens",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "included",
          type: "bool",
          internalType: "bool",
        },
        {
          name: "amount",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "createSale",
      inputs: [
        {
          name: "propertyId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "price",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "saleDocumentURI",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "depositEscrow",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "expressInterest",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "feeCollector",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getActiveSaleForProperty",
      inputs: [
        {
          name: "propertyId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getEscrowBalance",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSale",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "tuple",
          internalType: "struct RealEstateSale.Sale",
          components: [
            {
              name: "propertyId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "seller",
              type: "address",
              internalType: "address",
            },
            {
              name: "buyer",
              type: "address",
              internalType: "address",
            },
            {
              name: "price",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "notary",
              type: "address",
              internalType: "address",
            },
            {
              name: "status",
              type: "uint8",
              internalType: "enum RealEstateSale.SaleStatus",
            },
            {
              name: "createdAt",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "updatedAt",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "completedAt",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "saleDocumentURI",
              type: "string",
              internalType: "string",
            },
            {
              name: "rentableTokensIncluded",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "rentableTokenAmount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "isAuthorizedNotary",
      inputs: [
        {
          name: "notary",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "owner",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "platformFeePercentage",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "propertyToActiveSale",
      inputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "propertyToken",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract RealEstateERC721",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "removeNotary",
      inputs: [
        {
          name: "notary",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "rentableToken",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract RentableToken",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "saleCounter",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "saleEscrow",
      inputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "sales",
      inputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "propertyId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "seller",
          type: "address",
          internalType: "address",
        },
        {
          name: "buyer",
          type: "address",
          internalType: "address",
        },
        {
          name: "price",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "notary",
          type: "address",
          internalType: "address",
        },
        {
          name: "status",
          type: "uint8",
          internalType: "enum RealEstateSale.SaleStatus",
        },
        {
          name: "createdAt",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "updatedAt",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "completedAt",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "saleDocumentURI",
          type: "string",
          internalType: "string",
        },
        {
          name: "rentableTokensIncluded",
          type: "bool",
          internalType: "bool",
        },
        {
          name: "rentableTokenAmount",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "transferOwnership",
      inputs: [
        {
          name: "newOwner",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "updateFeeCollector",
      inputs: [
        {
          name: "newFeeCollector",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "updatePlatformFee",
      inputs: [
        {
          name: "newFeePercentage",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "updateSalePrice",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "newPrice",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "event",
      name: "BuyerAssigned",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "buyer",
          type: "address",
          indexed: false,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "EscrowDeposited",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "buyer",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "FeeCollectorUpdated",
      inputs: [
        {
          name: "oldCollector",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "newCollector",
          type: "address",
          indexed: false,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "NotaryAssigned",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "notary",
          type: "address",
          indexed: false,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "NotaryAuthorized",
      inputs: [
        {
          name: "notary",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "NotaryRemoved",
      inputs: [
        {
          name: "notary",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "PlatformFeeUpdated",
      inputs: [
        {
          name: "oldFee",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "newFee",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "PriceUpdated",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "oldPrice",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "newPrice",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "RentableTokensConfigured",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "included",
          type: "bool",
          indexed: false,
          internalType: "bool",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "SaleApproved",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "notary",
          type: "address",
          indexed: false,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "SaleCancelled",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "reason",
          type: "string",
          indexed: false,
          internalType: "string",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "SaleCompleted",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "propertyId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "seller",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "buyer",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "price",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "SaleCreated",
      inputs: [
        {
          name: "saleId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "propertyId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "seller",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "price",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "error",
      name: "ReentrancyGuardReentrantCall",
      inputs: [],
    },
  ] as const
  
  // Lending Protocol ABI
  export const LendingProtocolABI = [
    {
      type: "constructor",
      inputs: [
        {
          name: "_propertyToken",
          type: "address",
          internalType: "address",
        },
        {
          name: "_minLoanAmount",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "_maxLoanToValueRatio",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "_liquidationThreshold",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "_liquidationPenalty",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "_protocolFeePercentage",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "_feeCollector",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "receive",
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "addLoanOfficer",
      inputs: [
        {
          name: "officer",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "approveLoan",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "auctions",
      inputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "propertyId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "startingPrice",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "currentPrice",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "startTime",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "endTime",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "highestBidder",
          type: "address",
          internalType: "address",
        },
        {
          name: "highestBid",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "finalized",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "borrowerLoans",
      inputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "calculateInterest",
      inputs: [
        {
          name: "principal",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "interestRate",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "timeElapsed",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "pure",
    },
    {
      type: "function",
      name: "calculatePayoffAmount",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "feeCollector",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "finalizeAuction",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "fundLoan",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "getActiveLoanForProperty",
      inputs: [
        {
          name: "propertyId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getAuction",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "tuple",
          internalType: "struct LendingProtocol.Auction",
          components: [
            {
              name: "loanId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "propertyId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "startingPrice",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "currentPrice",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "startTime",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "endTime",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "highestBidder",
              type: "address",
              internalType: "address",
            },
            {
              name: "highestBid",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "finalized",
              type: "bool",
              internalType: "bool",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getBorrowerLoans",
      inputs: [
        {
          name: "borrower",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256[]",
          internalType: "uint256[]",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLoan",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "tuple",
          internalType: "struct LendingProtocol.Loan",
          components: [
            {
              name: "propertyId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "borrower",
              type: "address",
              internalType: "address",
            },
            {
              name: "principal",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "interestRate",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "originationFee",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "term",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "startTime",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "maturityTime",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "lastInterestCalcTime",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "totalRepaid",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "remainingPrincipal",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "status",
              type: "uint8",
              internalType: "enum LendingProtocol.LoanStatus",
            },
            {
              name: "loanOfficer",
              type: "address",
              internalType: "address",
            },
            {
              name: "loanToValueRatio",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "liquidationThreshold",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLoanPayments",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "tuple[]",
          internalType: "struct LendingProtocol.Payment[]",
          components: [
            {
              name: "loanId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "amount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "timestamp",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "principalPortion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "interestPortion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "feePortion",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "isLoanOfficer",
      inputs: [
        {
          name: "officer",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "liquidationPenalty",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "liquidationThreshold",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "loanCounter",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "loanOfficers",
      inputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "loanPayments",
      inputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "amount",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "timestamp",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "principalPortion",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "interestPortion",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "feePortion",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "loans",
      inputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "propertyId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "borrower",
          type: "address",
          internalType: "address",
        },
        {
          name: "principal",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "interestRate",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "originationFee",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "term",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "startTime",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "maturityTime",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "lastInterestCalcTime",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "totalRepaid",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "remainingPrincipal",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "status",
          type: "uint8",
          internalType: "enum LendingProtocol.LoanStatus",
        },
        {
          name: "loanOfficer",
          type: "address",
          internalType: "address",
        },
        {
          name: "loanToValueRatio",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "liquidationThreshold",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "makeRepayment",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "markAsDefaulted",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "maxLoanToValueRatio",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "minLoanAmount",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "onERC721Received",
      inputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
        {
          name: "",
          type: "address",
          internalType: "address",
        },
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "",
          type: "bytes",
          internalType: "bytes",
        },
      ],
      outputs: [
        {
          name: "",
          type: "bytes4",
          internalType: "bytes4",
        },
      ],
      stateMutability: "pure",
    },
    {
      type: "function",
      name: "owner",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "placeBid",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "propertyToActiveLoan",
      inputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "propertyToAuction",
      inputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "propertyToken",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract RealEstateERC721",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "protocolFeePercentage",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "removeLoanOfficer",
      inputs: [
        {
          name: "officer",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "requestLoan",
      inputs: [
        {
          name: "propertyId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "loanAmount",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "interestRate",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "term",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "startLiquidationAuction",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "auctionDuration",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "transferOwnership",
      inputs: [
        {
          name: "newOwner",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "updateFeeCollector",
      inputs: [
        {
          name: "newFeeCollector",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "updateProtocolParameters",
      inputs: [
        {
          name: "_minLoanAmount",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "_maxLoanToValueRatio",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "_liquidationThreshold",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "_liquidationPenalty",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "_protocolFeePercentage",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "event",
      name: "AuctionBid",
      inputs: [
        {
          name: "auctionId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "bidder",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "AuctionFinalized",
      inputs: [
        {
          name: "auctionId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "winner",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "AuctionStarted",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "propertyId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "startingPrice",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "CollateralLiquidated",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "propertyId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "FeeCollectorUpdated",
      inputs: [
        {
          name: "oldCollector",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "newCollector",
          type: "address",
          indexed: false,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "LoanApproved",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "loanOfficer",
          type: "address",
          indexed: false,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "LoanDefaulted",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "LoanFullyRepaid",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "LoanFunded",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "LoanOfficerAdded",
      inputs: [
        {
          name: "officer",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "LoanOfficerRemoved",
      inputs: [
        {
          name: "officer",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "LoanRepayment",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "principalPortion",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "interestPortion",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "LoanRequested",
      inputs: [
        {
          name: "loanId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "propertyId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "borrower",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "ProtocolParametersUpdated",
      inputs: [
        {
          name: "parameter",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        {
          name: "value",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "error",
      name: "ReentrancyGuardReentrantCall",
      inputs: [],
    },
  ] as const
  
  // Sale status enum to match the contract
  export enum SaleStatus {
    Created = 0,
    Active = 1,
    PendingApproval = 2,
    Approved = 3,
    Completed = 4,
    Cancelled = 5,
  }
  
  // Loan status enum to match the contract
  export enum LoanStatus {
    Requested = 0,
    Approved = 1,
    Funded = 2,
    Active = 3,
    Repaid = 4,
    Defaulted = 5,
    Liquidated = 6,
  }
  