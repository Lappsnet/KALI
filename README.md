# KALI Real Estate Platform: The Future of Property Transactions on Pharos

**Unlock the potential of real estate through seamless, secure, and transparent tokenization.**

---

## Executive Summary

KALI is a comprehensive, blockchain-based platform designed to fundamentally modernize the real estate industry. By leveraging the power of smart contracts and NFT technology on the high-performance **Pharos Network**, KALI transforms illiquid, complex real estate assets into easily manageable, tradable, and financeable digital tokens. Our ecosystem facilitates the entire property lifecycle – from tokenization and listing to sales, rentals, collateralized lending, and fractional ownership – creating unprecedented efficiency, accessibility, and liquidity in the global real estate market.

---

## The KALI Ecosystem: A Modular Approach

Our platform is built on a suite of specialized, interconnected smart contracts:

1.  **`RealEstateERC721` (NFT Core):** Represents unique, verifiable ownership of individual properties as ERC721 tokens. Stores essential property metadata on-chain.
2.  **`MarketplaceOrchestrator` (Hub):** The central discovery layer. Enables owners to list properties for sale or rent, providing a unified view for potential buyers and tenants.
3.  **`RealEstateSale` (Sales Engine):** Manages the atomic swap of property NFTs for payment, incorporating notary verification and secure escrow for trustless transactions.
4.  **`RentalAgreement` (Leasing Engine):** Automates lease management, including rent collection (ETH), security deposit handling, and lease status tracking via smart contracts.
5.  **`LendingProtocol` (DeFi Integration):** Allows property NFT holders to access liquidity by using their tokenized assets as collateral for decentralized loans.
6.  **`FractionalOwnership` (Investment Democratization):** Enables owners to divide high-value properties into smaller, tradable ERC20 shares (FRETs), lowering the barrier to real estate investment.
7.  **`RentableToken` (Utility/Yield - Optional):** An ERC20 token designed for potential platform utility, yield distribution from rental income, or staking rewards within the KALI ecosystem.

---

## Target Network: Pharos

KALI is optimized for deployment on the **Pharos Network**, chosen for its key advantages:

* **High Throughput & Speed:** Essential for handling real-time marketplace interactions and near-instantaneous transaction confirmations.
* **Low Transaction Costs:** Makes micro-transactions (like rent payments or share purchases) economically viable.
* **Security & Trustlessness:** Provides a robust, decentralized foundation for high-value asset management.
* **Scalability:** Allows KALI to grow and serve a global user base.

### Pharos Network Details:

* **Network Name:** Pharos Network (or Pharos Devnet)
* **Chain ID:** `50002`
* **RPC URL:** `https://devnet.dplabs-internal.com`
* **Currency Symbol:** `ETH` *(Verify)*
* **Block Explorer:** `https://pharosscan.xyz/`

---

## Developer Setup & Interaction

This project utilizes the **Foundry** framework.

### Prerequisites

* **Foundry:** Install via `curl -L https://foundry.paradigm.xyz | bash` then `foundryup`. (See [Foundry Book](https://book.getfoundry.sh/))
* **Git:** To clone the repository.
* **Wallet & Funds:** A wallet (like MetaMask) configured for the Pharos Network and funded with its native gas token (Pharos Token).  

**WARNING** Use separate addresses/keys for testing different roles.

### Configuration

1.  **Clone:** `git clone <https://github.com/Lappsnet/KALI.git> && cd <KALI>`
2.  **Install Dependencies:** `forge install` (if applicable)
3.  **Compile:** `forge build`
4.  **Environment Variables:** Create/populate a `.env` file (add to `.gitignore`!) in the project root:

    ```dotenv
    # Required for all script interactions
    RPC_URL=[https://devnet.dplabs-internal.com/](https://devnet.dplabs-internal.com/)
    MY_PK=0xYourPrivateKeyForTestingRole # e.g., Owner, Seller, Buyer, Tenant...
    MY_ADDRESS=0xPublicKeyCorrespondingToPK


    # --- Variables for Specific Interaction Scripts ---
    # PROPERTY_ID=5
    # SALE_ID=1
    # RENTAL_ID=1
    # PRICE_WEI=100000000000000000 # 0.001 ETH example
    # TENANT_ADDRESS=0x...
    # AMOUNT_WEI=100000000000000000 # 0.O1 ETH example
    # ... (add others as defined in specific scripts)
    ```
    *Load variables:* `source .env` or export directly.

### Deployment

* Use the deployment scripts in the `script/` directory (e.g., `DeployRealEstateER721.s.sol`).
* Ensure `MY_PK` in `.env` is the desired **deployer/owner** key.
* Run: `forge script script/DeployRealEstateER721.s.sol:DeployRealEstateER721 --rpc-url $RPC_URL --private-key $MY_PK --broadcast [--verify]`
* Record the deployed contract addresses and update interaction scripts / frontend configs.

### Running Interaction Scripts

Scripts in the `script/` directory (e.g., `InteractRealEstateSale.s.sol`) facilitate testing specific functions on the deployed contracts.

1.  **Select Script & Action:** Choose the script matching the contract you want to interact with. Edit the script's `run()` function to uncomment **only the single action** (helper function call) you wish to perform.
2.  **Set Role & Variables:** Ensure `MY_PK` corresponds to the address holding the **required role** (Owner, Seller, Buyer, Notary, Tenant, etc.) for that specific action. Export any necessary parameters (e.g., `PROPERTY_ID`, `SALE_ID`, `AMOUNT_WEI`) as environment variables.
3.  **Execute:**
    * Read Operations: `forge script ... --rpc-url $RPC_URL --private-key $MY_PK`
    * Write Operations: `forge script ... --rpc-url $RPC_URL --private-key $MY_PK --broadcast`
4.  **Verify:** Check console output and the Pharos Block Explorer (`pharosscan.xyz`) for transaction status and results.

**Note:** Test flows sequentially, respecting dependencies between actions (e.g., Approve NFT -> Create Sale -> Express Interest -> ...).

---

## Vision & Potential Impact

KALI is more than just a marketplace; it's foundational infrastructure for the future of real estate. By bringing transparency, efficiency, and liquidity to this massive asset class, KALI aims to:

* **Empower Owners:** Provide new avenues for liquidity and value generation (sales, rentals, lending, fractionalization).
* **Lower Barriers for Investors:** Enable fractional ownership, making high-value real estate accessible to a broader audience.
* **Streamline Transactions:** Drastically reduce the time, cost, and complexity associated with traditional property deals.
* **Enhance the Pharos Ecosystem:** Drive significant Real-World Asset (RWA) activity and demonstrate the network's capability for complex, high-value applications.

We believe KALI has the potential to capture a significant share of the burgeoning tokenized asset market.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
