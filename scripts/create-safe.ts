import { SafeAccountConfig, SafeFactory } from '@safe-global/safe-core-sdk';
import EthersAdapter from '@safe-global/safe-ethers-lib';
import { ethers } from 'hardhat';
import { DEVELOPMENT_CHAINS } from '../helper-hardhat-config';

const main = async () => {
    if (!process.env.OWNERS || process.env.OWNERS.length === 0) {
        console.log('Please define the owners parameter in the env file.');
        return;
    }

    if (!process.env.THRESHOLD || +process.env.THRESHOLD <= 0) {
        console.log('Please define threshold in the env file.');
        return;
    }

    const networkName = (await ethers.provider.getNetwork()).name;

    if (!DEVELOPMENT_CHAINS.includes(networkName)) {
        const [signer] = await ethers.getSigners();
        const owners = process.env.OWNERS.split(',');
        const threshold = +process.env.THRESHOLD;

        console.log('Creation of Safe has been stared.');

        const safeAccountConfig: SafeAccountConfig = {
            owners: owners,
            threshold: threshold,
        };

        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer,
        });

        const safeFactory = await SafeFactory.create({ ethAdapter });
        const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });

        console.log('Safe has been created at: ', safeSdk.getAddress());
    }
};

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
