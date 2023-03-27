import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import 'dotenv/config';
import 'hardhat-deploy';

import { HardhatUserConfig } from 'hardhat/config';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.19',
        settings: {
            optimizer: {
                enabled: true,
                runs: 100,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
        },
        localhost: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [
                PRIVATE_KEY,
                'ec5775f230fd186ac5a14e01003ddf07ce3b91225e2f9aa5693018cb50a6a687',
            ],
            chainId: 5,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
};

export default config;
