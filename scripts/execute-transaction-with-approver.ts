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

    if (!process.env.APPROVER) {
        console.log('Please define Approver address in env. file.');
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

        console.log(
            'Asking approver to sign the transaction has been started.'
        );

        const approver = await ethers.getContractAt(
            'Approver',
            process.env.APPROVER
        );

        const approveTx = await approver
            .connect(proposer)
            .approve(
                tx.data.to,
                tx.data.value,
                tx.data.data,
                tx.data.operation,
                tx.data.safeTxGas,
                tx.data.baseGas,
                tx.data.gasPrice,
                tx.data.gasToken,
                tx.data.refundReceiver,
                tx.data.nonce
            );
        await approveTx.wait(1);

        console.log('Approver has approved the transaction');

        console.log(
            'Transaction execution has been started. If there is not enought signatures the transaction will fail.'
        );

        try {
            const addApproverTransaction = await proposerSdk.executeTransaction(
                tx
            );
            await addApproverTransaction.transactionResponse?.wait(1);

            console.log('Transaction has been executed.');
        } catch (e) {
            console.log(
                'There was a problem during transaction execution: ',
                e
            );
        }
    }
};

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
