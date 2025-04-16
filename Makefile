# Makefile for deploying to Base Sepolia using Foundry

# Your variables
SCRIPT_PATH = script/DeployRentableToken.s.sol
PRIVATE_KEY = 0xb3becc287d92f53db0c83dff1b2612b31eb33e81af2322b2dfa49db09e36e830
RPC_URL = https://rpc.sepolia.org 

deploy:
	forge script $(SCRIPT_PATH) \
		--rpc-url $(RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast
