# RENTAL AGREEMENT - Tokenized Property

**Date:** April 24, 2025

**Blockchain Network:** Pharos Network (Chain ID: 50002)
**Rental Agreement Smart Contract:** 0x60B5cC9C3A6bb42A293Cd445d67DE23CcdA442c3
**Rental ID (Once Created):** Pending On-Chain Creation

---

## 1. PARTIES

* **Landlord:**
    * Name/Entity: Propiedades Digitales S.A. de C.V.
    * Wallet Address: 0x251d8803f71a8402dD96893E0709588e99F6267c
    * Wallet Address: [] *(Replace with actual Landlord/Owner wallet address)*
* **Tenant:**
    * Name/Entity: Juan Perez
    * Wallet Address: 0x251d8803f71a8402dD96893E0709588e99F6267c

---

## 2. PROPERTY

* **Tokenized Property Reference:** RealEstateERC721 Token ID #[Assumed to be 5, based on previous script example `CADAST_MINT_5`] *(Confirm correct Token ID)*
* **Associated Smart Contract:** 0xD95d1FF6618AEE41e431C6A2cfa3D5e8ff3d5f33
* **Cadastral Number (from NFT):** CADAST_MINT_5 *(Match the NFT being rented)*
* **Physical Address/Location (from NFT):** 93 Rosa Ln, Santa Tecla, El Salvador *(Adjusted to likely user location)*
* **Description:** Modern 2-bedroom residence in Santa Tecla. *(Match NFT metadata)*

---

## 3. TERM

* **Lease Start Date:** April 24, 2025 *(Or actual date of successful contract creation)*
* **Lease End Date:** April 23, 2026
* **Duration:** 12 Months

---

## 4. RENT

* **Monthly Rent Amount:** 0.5 ETH
* **Due Date:** Rent is due on the 1st day of each calendar month.
* **Payment Method:** Rent shall be paid by the Tenant executing the `payRent(uint256 rentalId)` function on the Rental Agreement Smart Contract (0x60B5cC9C3A6bb42A293Cd445d67DE23CcdA442c3) sending the required rent amount in Wei.

---

## 5. SECURITY DEPOSIT

* **Amount:** 1 ETH
* **Payment:** Tenant agrees to pay the Security Deposit amount via smart contract interaction upon rental creation, as required by the `createRental` function's logic. This amount will be held by the Rental Agreement Smart Contract.
* **Return:** The Security Deposit will be returned to the Tenant's Wallet Address (0x251d...) within 30 days of lease termination, less any deductions for damages beyond normal wear and tear or unpaid rent, executed via the `returnSecurityDeposit(uint256 rentalId, uint256 deductions)` function by the Landlord/Manager.

---

## 6. USE OF PREMISES

* The property shall be used solely as a private residence by the Tenant. No other occupants unless agreed in writing.
* No smoking is permitted inside the premises. Small domestic pets may be allowed with prior written consent from the Landlord and potentially an additional pet deposit. No structural alterations are permitted without Landlord consent.

---

## 7. MAINTENANCE & REPAIRS

* **Landlord Responsibilities:** Maintain structural integrity, roof, foundation, and ensure essential services (plumbing, electrical, water supply) are functional.
* **Tenant Responsibilities:** Keep premises clean and sanitary, report damages or required repairs promptly, responsible for minor upkeep (e.g., changing lightbulbs), dispose of waste according to local regulations.

---

## 8. UTILITIES

* Tenant is responsible for contracting and paying for electricity, internet, and any gas services. Landlord is responsible for the primary water supply connection fee (ANDA).

---

## 9. DEFAULT & TERMINATION

* Default occurs if rent is not paid within 10 days of the due date.
* After the initial 12-month term, this agreement may continue month-to-month unless terminated by either party with 30 days written notice. Termination during the initial term is subject to penalties as outlined by applicable law and contract status (e.g., `terminateRental` function use requires specific conditions). Refer to contract functions `terminateRental` and `expireRental`.

---

## 10. GOVERNING LAW

* This agreement shall be governed by and construed in accordance with the laws of El Salvador.

---

## 11. SMART CONTRACT INTERACTION

* The Parties acknowledge that certain aspects of this agreement (rent payment, security deposit handling, rental status) are managed via the Rental Agreement Smart Contract at address 0x60B5cC9C3A6bb42A293Cd445d67DE23CcdA442c3 on the Pharos Network.
* The Parties agree to interact with the smart contract functions (`payRent`, etc.) as required using cryptographically secure wallets associated with the addresses listed in Section 1.

---

## 12. ENTIRE AGREEMENT

* This document and the referenced smart contract constitute the entire agreement between the parties.

---

**SIGNATURES**

*(Note: This section represents off-chain agreement unless integrated with digital signature solutions)*

**Landlord:**

Signature: _________________________ Date: ___________
Printed Name: [Representative of Propiedades Digitales S.A. de C.V.]

**Tenant:**

Signature: _________________________ Date: ___________
Printed Name: Juan Perez