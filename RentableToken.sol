// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RentableToken is ERC20, Ownable {
    uint256 public constant TOKEN_PRICE = 500; // Precio del token en euros
    uint256 public constant INITIAL_SUPPLY = 3000; // Suministro inicial de tokens
    uint256 public constant RETURN_RATE = 8; // 8% de rentabilidad anual
    uint256 public constant MAX_TRANSFERS = 2;

    mapping(address => uint256) private transferCount;
    mapping(address => uint256) private burnCount;
    mapping(address => uint256) private purchaseTime;

    event TokensPurchased(address indexed buyer, uint256 amount);
    event RentabilityPaid(address indexed to, uint256 amount);

    constructor() ERC20("RentableToken", "KLI") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY * (10 ** uint256(decimals())));
    }

    function buyTokens(uint256 amount) public payable {
        require(amount > 0, "Debe comprar al menos 1 token");
        require(msg.value == amount * TOKEN_PRICE, "Fondos insuficientes para la compra");

        _transfer(owner(), msg.sender, amount * (10 ** uint256(decimals())));
        purchaseTime[msg.sender] = block.timestamp;

        emit TokensPurchased(msg.sender, amount);
    }

    function payRentability(address to) public onlyOwner {
        uint256 tokens = balanceOf(to);
        require(tokens > 0, "El destinatario no tiene tokens");

        uint256 timeHeld = block.timestamp - purchaseTime[to];
        uint256 yearsHeld = timeHeld / 365 days;
        uint256 rentability = tokens * RETURN_RATE / 100 * yearsHeld;

        _mint(to, rentability);

        emit RentabilityPaid(to, rentability);
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(transferCount[msg.sender] < MAX_TRANSFERS, "Transfer limit reached");
        transferCount[msg.sender]++;
        return super.transfer(recipient, amount);
    }

    function burn(uint256 amount) public {
        require(burnCount[msg.sender] < MAX_TRANSFERS, "Burn limit reached");
        burnCount[msg.sender]++;
        _burn(msg.sender, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(transferCount[sender] < MAX_TRANSFERS, "Transfer limit reached for sender");
        transferCount[sender]++;
        return super.transferFrom(sender, recipient, amount);
    }
}
