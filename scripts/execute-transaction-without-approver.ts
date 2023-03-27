import Safe from '@safe-global/safe-core-sdk';
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';
import EthersAdapter from '@safe-global/safe-ethers-lib';
import { ethers } from 'hardhat';
import { DEVELOPMENT_CHAINS } from '../helper-hardhat-config';

const main = async () => {
    if (!process.env.OWNERS_PRIVATE_KEYS) {
        console.log('Please define owners private keys in env file.');
        return;
    }

    if (!process.env.SAFE) {
        console.log('Please define Safe address in env. file.');
        return;
    }

    const networkName = (await ethers.provider.getNetwork()).name;

    if (!DEVELOPMENT_CHAINS.includes(networkName)) {
        console.log('Proces has been started.');

        const safeAddress = process.env.SAFE;
        const ownersKeys = process.env.OWNERS_PRIVATE_KEYS.split(',');

        const proposer = new ethers.Wallet(ownersKeys[0], ethers.provider);
        const proposerAndExecutorAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: proposer,
        });

        const proposerSdk = await Safe.create({
            ethAdapter: proposerAndExecutorAdapter,
            safeAddress,
        });

        const transactionData: SafeTransactionDataPartial = {
            to: proposer.address,
            value: ethers.utils.parseEther('0.01').toString(),
            data: '0x',
        };

        let tx = await proposerSdk.createTransaction({
            safeTransactionData: transactionData,
        });

        const threshold = await proposerSdk.getThreshold();

        console.log('Signing transaction to reach threshold has been started.');

        for (let i = 1; i < threshold; i++) {
            const owner = new ethers.Wallet(ownersKeys[i], ethers.provider);
            const ethAdapter = new EthersAdapter({
                ethers,
                signerOrProvider: owner,
            });

            const safeSdk = await Safe.create({ ethAdapter, safeAddress });
            tx = await safeSdk.signTransaction(tx);
        }

        console.log('Singatures tresholded has been reached.');

        console.log('Transaction execution has been started.');

        const addApproverTransaction = await proposerSdk.executeTransaction(tx);
        await addApproverTransaction.transactionResponse?.wait(1);

        console.log('Transaction has been executed.');
    }
};

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
