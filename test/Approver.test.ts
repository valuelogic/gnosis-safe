import { FakeContract, smock } from '@defi-wonderland/smock';
import { BigNumber } from '@ethersproject/bignumber';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { IERC165 } from '../typechain-types';
import { Approver, ISafe } from '../typechain-types/contracts';

describe('Approver', () => {
    const deploy = async () => {
        const safeMock: FakeContract<ISafe> = await smock.fake('ISafe');
        const transationValueLimit = ethers.utils.parseEther('0.1');
        const whitelistedProtocol = ethers.Wallet.createRandom().address;
        const [deployer, hacker] = await ethers.getSigners();
        const Approver = await ethers.getContractFactory('Approver');
        const approver: Approver = await Approver.deploy(
            safeMock.address,
            transationValueLimit,
            [whitelistedProtocol]
        );
        const nft: FakeContract<IERC165> = await smock.fake('IERC165');
        nft.supportsInterface.returns(true);

        return {
            approver,
            safeMock,
            transationValueLimit,
            whitelistedProtocol,
            deployer,
            hacker,
            nft,
        };
    };

    it('Should deploy', async () => {
        const {
            approver,
            safeMock,
            transationValueLimit,
            whitelistedProtocol,
        } = await deploy();

        expect(await approver.getSafe()).to.be.eq(safeMock.address);
        expect(await approver.getLimit()).to.be.eq(transationValueLimit);
        expect(await approver.isWhitelisted(whitelistedProtocol)).to.be.true;

        const notWhitelistedProtocol = ethers.Wallet.createRandom().address;
        expect(await approver.isWhitelisted(notWhitelistedProtocol)).to.be
            .false;
    });

    it('Should revert when add to whitelist not by an owner', async () => {
        const { approver, hacker } = await deploy();

        const newWhitelistedProtocol = ethers.Wallet.createRandom().address;

        await expect(
            approver.connect(hacker).addToWhitelist(newWhitelistedProtocol)
        ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should add to whitelist', async () => {
        const { approver } = await deploy();

        const newWhitelistedProtocol = ethers.Wallet.createRandom().address;

        await expect(approver.addToWhitelist(newWhitelistedProtocol))
            .to.emit(approver, 'WhitelistedAdded')
            .withArgs(newWhitelistedProtocol);
        expect(await approver.isWhitelisted(newWhitelistedProtocol)).to.be.true;
    });

    it('Should revert when remove to whitelist not by an owner', async () => {
        const { approver, whitelistedProtocol, hacker } = await deploy();

        await expect(
            approver.connect(hacker).removeFromWhitelist(whitelistedProtocol)
        ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should remove from whitelist', async () => {
        const { approver, whitelistedProtocol } = await deploy();

        await expect(approver.removeFromWhitelist(whitelistedProtocol))
            .to.emit(approver, 'WhitelistedRemoved')
            .withArgs(whitelistedProtocol);
        expect(await approver.isWhitelisted(whitelistedProtocol)).to.be.false;
    });

    it('Should revert when set a new limit not by an owner', async () => {
        const { approver, hacker } = await deploy();

        await expect(
            approver.connect(hacker).setLimit(ethers.utils.parseEther('1'))
        ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should set a new limit', async () => {
        const { approver } = await deploy();
        const newLimit = ethers.utils.parseEther('1');

        await expect(approver.setLimit(newLimit))
            .to.emit(approver, 'LimitChanged')
            .withArgs(newLimit);
        expect(await approver.getLimit()).to.be.eq(newLimit);
    });

    it('Should revert when approve by not the safe owners', async () => {
        const { approver, safeMock, hacker } = await deploy();
        safeMock.isOwner.whenCalledWith(hacker.address).returns(false);

        await expect(
            approver
                .connect(hacker)
                .approve(
                    hacker.address,
                    ethers.utils.parseEther('1'),
                    '0x',
                    0,
                    0,
                    0,
                    0,
                    '0x0000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000',
                    1
                )
        )
            .to.be.revertedWithCustomError(
                approver,
                'Approver__NotTheSafeOwner'
            )
            .withArgs(hacker.address);
    });

    it('Should revert when nft related transaction', async () => {
        const { approver, safeMock, nft } = await deploy();
        const data = '0x42966c68';
        const notWhitelistedProtocol = ethers.Wallet.createRandom().address;

        safeMock.isOwner.returns(true);

        await expect(
            approver.approve(
                nft.address,
                0,
                data,
                0,
                0,
                0,
                0,
                '0x0000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000',
                1
            )
        ).to.revertedWithCustomError(
            approver,
            'Approver__NftTransactionNotAllowed'
        );
        //  .withArgs(nft.address);
    });

    it('Should approve when protocol whitelisted', async () => {
        const { approver, safeMock, whitelistedProtocol } = await deploy();
        const data = '0x42966c68';
        const txHash = getTransationHash(
            whitelistedProtocol,
            BigNumber.from(0),
            data
        );
        safeMock.getTransactionHash.returns(txHash);
        safeMock.isOwner.returns(true);

        await expect(
            approver.approve(
                whitelistedProtocol,
                0,
                data,
                0,
                0,
                0,
                0,
                '0x0000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000',
                1
            )
        )
            .to.emit(approver, 'TransationApproved')
            .withArgs(txHash);
    });

    it('Should revert when protocol not whitelisted', async () => {
        const { approver, safeMock } = await deploy();
        const data = '0x42966c68';
        const notWhitelistedProtocol = ethers.Wallet.createRandom().address;

        safeMock.isOwner.returns(true);

        await expect(
            approver.approve(
                notWhitelistedProtocol,
                0,
                data,
                0,
                0,
                0,
                0,
                '0x0000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000',
                1
            )
        )
            .to.revertedWithCustomError(
                approver,
                'Approver__TransationNotAllowed'
            )
            .withArgs(notWhitelistedProtocol, 0, data);
    });

    it('Should approve when transation value not greater than the limit', async () => {
        const { approver, safeMock, deployer, transationValueLimit } =
            await deploy();
        const txHash = getTransationHash(
            deployer.address,
            transationValueLimit,
            '0x'
        );
        safeMock.getTransactionHash.returns(txHash);
        safeMock.isOwner.returns(true);

        await expect(
            approver.approve(
                deployer.address,
                0,
                '0x',
                0,
                0,
                0,
                0,
                '0x0000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000',
                1
            )
        )
            .to.emit(approver, 'TransationApproved')
            .withArgs(txHash);
    });

    it('Should revert when transation value above the limit', async () => {
        const { approver, safeMock, deployer, transationValueLimit } =
            await deploy();
        const transationValue = transationValueLimit.add(1);
        safeMock.isOwner.returns(true);

        await expect(
            approver.approve(
                deployer.address,
                transationValue,
                '0x',
                0,
                0,
                0,
                0,
                '0x0000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000',
                1
            )
        )
            .to.revertedWithCustomError(
                approver,
                'Approver__TransationNotAllowed'
            )
            .withArgs(deployer.address, transationValue, '0x');
    });
});

const getTransationHash = (to: string, value: BigNumber, data: string) => {
    const tx = {
        to: to,
        value: value,
        data: data,
        operation: 0,
        safeTxGas: 0,
        baseGas: 0,
        gasPrice: 0,
        gasToken: '0x0000000000000000000000000000000000000000',
        refundReceiver: '0x0000000000000000000000000000000000000000',
        nonce: 1,
    };

    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(tx)));
};
