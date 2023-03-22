import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DEVELOPMENT_CHAINS, networkConfig } from '../helper-hardhat-config';
import verify from '../utils/verify';

const deploy = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, network, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const safeAddress = networkConfig[network.name].safeAddress;
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

    if (
        !DEVELOPMENT_CHAINS.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(approver.address, args);
    }
};

export default deploy;
