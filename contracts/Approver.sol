//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import './ISafe.sol';

error Approver__NotTheSafeOwner(address who);
error Approver_NotSafe(address who);
error Approver_TransationNotAllowed(address to, uint256 value, bytes data);

contract Approver {
    event TransationApproved(bytes32 txHash);
    event LimitChanged(uint256 value);

    ISafe immutable i_safe;

    uint256 private s_limit;
    mapping(address => bool) private s_whitelist;

    constructor(address _safe, uint256 _limit, address[] memory _whitelist) {
        i_safe = ISafe(_safe);
        s_limit = _limit;

        uint256 length = _whitelist.length;
        for (uint16 i = 0; i < length; i++) {
            s_whitelist[_whitelist[i]] = true;
        }
    }

    modifier onlySafe() {
        if (msg.sender != address(i_safe)) {
            revert Approver__NotTheSafeOwner(msg.sender);
        }
        _;
    }

    function approve(
        address _to,
        uint256 _value,
        bytes calldata _data,
        ISafe.Operation _operation,
        uint256 _safeTxGas,
        uint256 _baseGas,
        uint256 _gasPrice,
        address _gasToken,
        address _refundReceiver,
        uint256 _nonce
    ) external {
        if (!i_safe.isOwner(msg.sender)) {
            revert Approver__NotTheSafeOwner(msg.sender);
        }

        if ((_data.length == 0 && _value < s_limit) || s_whitelist[_to]) {
            bytes32 txHash = i_safe.getTransactionHash(
                _to,
                _value,
                _data,
                _operation,
                _safeTxGas,
                _baseGas,
                _gasPrice,
                _gasToken,
                _refundReceiver,
                _nonce
            );

            i_safe.approveHash(txHash);
            emit TransationApproved(txHash);
        } else {
            revert Approver_TransationNotAllowed(_to, _value, _data);
        }
    }

    function addToWhitelist(address _to) external onlySafe {
        s_whitelist[_to] = true;
    }

    function removeFromWhitelist(address _to) external onlySafe {
        s_whitelist[_to] = false;
    }

    function setLimit(uint256 _limit) external onlySafe {
        s_limit = _limit;
        emit LimitChanged(_limit);
    }

    function isWhitelisted(address _address) external view returns (bool) {
        return s_whitelist[_address];
    }

    function getLimit() external view returns (uint256) {
        return s_limit;
    }
}
