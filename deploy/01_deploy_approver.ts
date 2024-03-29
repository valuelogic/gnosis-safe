import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DEVELOPMENT_CHAINS, networkConfig } from '../helper-hardhat-config';
import verify from '../utils/verify';

const deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, network, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    if(!process.env.SAFE) {
        console.log("Please define SAFE address in env. file.")
        return;
    }

    const safeAddress = process.env.SAFE;
    const transationValueLimit =
        networkConfig[network.name].transationValueLimit;
    const whitelist = networkConfig[network.name].whitelist;

    const args = [safeAddress, transationValueLimit, whitelist];

    const approver = await deploy('Approver', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmation || 0,
    });

    await transferOwnership(approver.address, safeAddress!);

    if (
        !DEVELOPMENT_CHAINS.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(approver.address, args);
    }
};

const transferOwnership = async (approverAddress: string, newOnwer: string) => {
    const approver = await ethers.getContractAt('Approver', approverAddress);
    const tx = await approver.transferOwnership(newOnwer);
    await tx.wait(1);

    console.log('Ownership transfered to the safe contract.');
};

export default deploy;
