import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

export const DEVELOPMENT_CHAINS = ['hardhat', 'localhost'];

export interface networkConfigItem {
    chainId: number;
    safeAddress?: string;
    whitelist?: string[];
    blacklist?: string[];
    transationValueLimit?: BigNumber;
    blockConfirmation?: number;
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    hardhat: {
        chainId: 31337,
        safeAddress: '0x1B55c54E870cb58d013B4AE39E276894ce1e0EdD',
        whitelist: [],
        transationValueLimit: ethers.utils.parseEther('0.001'),
    },
    localhost: {
        chainId: 31337,
        safeAddress: '0x1B55c54E870cb58d013B4AE39E276894ce1e0EdD',
        whitelist: [],
        transationValueLimit: ethers.utils.parseEther('0.001'),
    },
    sepolia: {
        chainId: 5,
        safeAddress: '0x1B55c54E870cb58d013B4AE39E276894ce1e0EdD',
        whitelist: [],
        transationValueLimit: ethers.utils.parseEther('0.001'),
        blockConfirmation: 3,
    },
};
