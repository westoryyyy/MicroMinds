.PHONY: all install build test coverage fmt lint deploy-testnet smoke-test help

-include .env

help: ## Show this help message
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install foundry dependencies
	forge install

build: ## Compile the smart contracts
	forge build

test: ## Run the full test suite
	forge test

coverage: ## Generate test coverage report
	forge coverage

fmt: ## Format Solidity code
	forge fmt

lint: ## Check Solidity code formatting
	forge fmt --check

deploy-testnet: ## Deploy Escrow contract to Monad Testnet and export ABI
	@echo "Deploying to Monad Testnet..."
	@forge script script/Deploy.s.sol:DeployEscrow --rpc-url $(ALCHEMY_RPC_URL) --broadcast --verify --verifier blockscout --verifier-url https://monad-testnet.socialscan.io/api
	@echo "Exporting deployment artifacts..."
	@./script/export.sh 10143

smoke-test: ## Run smoke test against the deployed contract
	@echo "Running Smoke Test on Monad Testnet..."
	@forge script script/SmokeTest.s.sol:SmokeTest --rpc-url $(ALCHEMY_RPC_URL) --broadcast
