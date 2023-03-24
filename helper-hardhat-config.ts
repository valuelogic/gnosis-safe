import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

export const DEVELOPMENT_CHAINS = ['hardhat', 'localhost'];

export interface networkConfigItem {
    chainId: number;
    whitelist: string[];
    transationValueLimit: BigNumber;
    blockConfirmation?: number;
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    hardhat: {
        chainId: 31337,
        whitelist: [],
        transationValueLimit: ethers.utils.parseEther('1'),
    },
    localhost: {
        chainId: 31337,
        whitelist: [],
        transationValueLimit: ethers.utils.parseEther('1'),
    },
    goerli: {
        chainId: 5,
        whitelist: [],
        transationValueLimit: ethers.utils.parseEther('1'),
        blockConfirmation: 3,
    },
};
