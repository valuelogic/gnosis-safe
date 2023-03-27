# Approver Contract

This is a smart contract that allows a designated entity to approve transactions for a Safe contract. The Approver contract is used to automate parcitular transaction in Safe. The Approver contract checks if the incoming transaction is allowed and if it is, then approves it for the Safe contract.

## Functionality

### Constructor
The `Approver` contract is initialized with the following arguments:

- `address _safe`: Address of the Safe contract that this Approver will be approving transactions for.
- `uint256 _limit`: Maximum transaction value allowed for Approver.
- `address[] memory _whitelist`: Addresses that are whitelisted to make transactions with Approver.

### approve
This function is called by the owner of the Safe contract to approve a transaction. The Approver contract verifies that the caller is the owner of the Safe contract and checks whether the transaction should be allowed. If the transaction is allowed, then the Approver contract approves the transaction by calling the approveHash function of the Safe contract.

### addToWhitelist
This function allows the owner of the Approver contract to add an address to the whitelist.

### removeFromWhitelist
This function allows the owner of the Approver contract to remove an address from the whitelist.

### setLimit
This function allows the owner of the Approver contract to set the maximum transaction value.

### getSafe
This function returns the address of the Safe contract that this Approver is approving transactions for.

### isWhitelisted
This function returns a boolean indicating whether the given address is whitelisted.

### getLimit
This function returns the current maximum transaction value that is allowed without approval from the Approver.

### isNFT
This is a private function used to check whether the target address of a transaction is an NFT contract.

## Events
### TransationApproved
This event is emitted when a transaction is approved by the Approver contract.

### WhitelistedAdded
This event is emitted when an address is added to the whitelist.

### WhitelistedRemoved
This event is emitted when an address is removed from the whitelist.

### LimitChanged
This event is emitted when the maximum transaction value is changed.

## Environment Variables
- `ETHERSCAN_API_KEY`: The API key for Etherscan, a block explorer for Ethereum.
- `PRIVATE_KEY`: The private key for the Ethereum account. This is used to deploy Approver contract to the blockchain.
- `GOERLI_RPC_URL`: The RPC URL for the Goerli testnet. This is used to connect to the test network and interact with the blockchain.
- `OWNERS`: A comma-separated list of Ethereum addresses that are owners of the Safe contract.
- `OWNERS_PRIVATE_KEYS`: A comma-separated list of private keys for the Safe owners addresses.
- `THRESHOLD`: The minimum number of owner signatures required to make transaction within Safe.
- `SAFE`: The address of the Safe contract.
- `APPROVER`: The address of the deployed Approver contract.

## How to use it

At the very begining you should create the `.env` file with values described above. `SAFE` address should be taken from your existing Safe contract. If you haven't created any Safe you can use `create-safe.ts` file from `scripts` folder. To do it you should run `npx hardhat run scripts/create-safe.ts --network goerli` command. When Safe is created please add its address to the `.env` file.
<br/> <br/>
Next step is to deploy the `Approver` contract. You can use for that `npx hardhat deploy --network goerli` command. Druign this process the contract will be deployed and the ownership will be transfered to the Safe contract. Because of that whiltelist and transaction limit changes will be only possible through Safe flow. When the deployment process is ready please add the Approver address to the `.env` file.
<br/> <br/>
Now it is time to add the Approver contract to the Safe, as one of the signers. To do it you should run `npm hardhat run scripts/add-approver.ts --network goerli`. When it is done you can sign transactions with the Approver functionality.
<br/> <br/>
There are two additional scripts to show how the signing transaction process could look like. The first one called `execute-transaction-without-approver.ts` use the standard where only private keys owners can sign transaction. To use it you can run `hh run scripts/execute-transaction-without-approver.ts --network goerli` command.
<br/> <br/>
The second script uses Approver contract to an add additional signature when transations meets implemented conditions. It means that if Safe needs 2 signatures to execute a transation you can use Approver to get one of them and execute the transation. To run the example you can use `hh run scripts/execute-transaction-with-approver.ts --network goerli`

