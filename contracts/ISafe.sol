//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface ISafe {

    enum Operation {
        Call,
        DelegateCall
    }

    function approveHash(bytes32 hashToApprove) external;
    function getTransactionHash(
        address to,
        uint256 value,
        bytes calldata data,
        Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address refundReceiver,
        uint256 _nonce
    ) external view returns (bytes32);

    function isOwner(address owner) external view returns (bool);

}
