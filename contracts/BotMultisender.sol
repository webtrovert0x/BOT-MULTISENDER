// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

/**
 * @title BotMultisender
 * @dev High performance, gas-optimized batch sender for Native BOT and ERC-20 tokens on Botchain.
 */
contract BotMultisender {
    // Custom Errors
    error ArrayLengthMismatch();
    error EmptyRecipients();
    error InsufficientNativeSent(uint256 sent, uint256 required);
    error NativeTransferFailed(address recipient, uint256 amount);
    error TokenTransferFailed(address token, address recipient, uint256 amount);
    error RefundFailed();
    error ZeroAddress();

    // Events
    event NativeMultisend(
        address indexed sender,
        uint256 totalAmount,
        uint256 recipientCount
    );

    event TokenMultisend(
        address indexed token,
        address indexed sender,
        uint256 totalAmount,
        uint256 recipientCount
    );

    /**
     * @notice Batch send native BOT with different amounts to each recipient.
     * @param recipients Array of recipient addresses.
     * @param amounts Array of amounts (in wei) corresponding to each recipient.
     */
    function multisendNative(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable {
        uint256 length = recipients.length;
        if (length == 0) revert EmptyRecipients();
        if (length != amounts.length) revert ArrayLengthMismatch();

        uint256 totalRequired = 0;
        for (uint256 i = 0; i < length; ) {
            totalRequired += amounts[i];
            unchecked { ++i; }
        }

        if (msg.value < totalRequired) {
            revert InsufficientNativeSent(msg.value, totalRequired);
        }

        for (uint256 i = 0; i < length; ) {
            address recipient = recipients[i];
            uint256 amount = amounts[i];
            if (recipient == address(0)) revert ZeroAddress();

            if (amount > 0) {
                (bool success, ) = recipient.call{value: amount}("");
                if (!success) revert NativeTransferFailed(recipient, amount);
            }
            unchecked { ++i; }
        }

        // Refund excess native tokens
        uint256 excess = msg.value - totalRequired;
        if (excess > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: excess}("");
            if (!refundSuccess) revert RefundFailed();
        }

        emit NativeMultisend(msg.sender, totalRequired, length);
    }

    /**
     * @notice Batch send identical amount of native BOT to each recipient.
     * @param recipients Array of recipient addresses.
     * @param amount Amount (in wei) to send to each recipient.
     */
    function multisendNativeSameValue(
        address[] calldata recipients,
        uint256 amount
    ) external payable {
        uint256 length = recipients.length;
        if (length == 0) revert EmptyRecipients();

        uint256 totalRequired = amount * length;
        if (msg.value < totalRequired) {
            revert InsufficientNativeSent(msg.value, totalRequired);
        }

        for (uint256 i = 0; i < length; ) {
            address recipient = recipients[i];
            if (recipient == address(0)) revert ZeroAddress();

            if (amount > 0) {
                (bool success, ) = recipient.call{value: amount}("");
                if (!success) revert NativeTransferFailed(recipient, amount);
            }
            unchecked { ++i; }
        }

        // Refund excess
        uint256 excess = msg.value - totalRequired;
        if (excess > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: excess}("");
            if (!refundSuccess) revert RefundFailed();
        }

        emit NativeMultisend(msg.sender, totalRequired, length);
    }

    /**
     * @notice Batch send ERC-20 tokens with different amounts to each recipient.
     * @param token Address of the ERC-20 token.
     * @param recipients Array of recipient addresses.
     * @param amounts Array of token amounts corresponding to each recipient.
     */
    function multisendToken(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        if (token == address(0)) revert ZeroAddress();
        uint256 length = recipients.length;
        if (length == 0) revert EmptyRecipients();
        if (length != amounts.length) revert ArrayLengthMismatch();

        uint256 totalSent = 0;

        for (uint256 i = 0; i < length; ) {
            address recipient = recipients[i];
            uint256 amount = amounts[i];
            if (recipient == address(0)) revert ZeroAddress();

            if (amount > 0) {
                totalSent += amount;
                _safeTransferFrom(token, msg.sender, recipient, amount);
            }
            unchecked { ++i; }
        }

        emit TokenMultisend(token, msg.sender, totalSent, length);
    }

    /**
     * @notice Batch send identical amount of ERC-20 tokens to each recipient.
     * @param token Address of the ERC-20 token.
     * @param recipients Array of recipient addresses.
     * @param amount Amount of tokens to send to each recipient.
     */
    function multisendTokenSameValue(
        address token,
        address[] calldata recipients,
        uint256 amount
    ) external {
        if (token == address(0)) revert ZeroAddress();
        uint256 length = recipients.length;
        if (length == 0) revert EmptyRecipients();

        uint256 totalSent = amount * length;

        for (uint256 i = 0; i < length; ) {
            address recipient = recipients[i];
            if (recipient == address(0)) revert ZeroAddress();

            if (amount > 0) {
                _safeTransferFrom(token, msg.sender, recipient, amount);
            }
            unchecked { ++i; }
        }

        emit TokenMultisend(token, msg.sender, totalSent, length);
    }

    /**
     * @dev Internal helper to safely transfer ERC-20 tokens handling non-standard tokens.
     */
    function _safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, value)
        );
        if (!success || (data.length > 0 && !abi.decode(data, (bool)))) {
            revert TokenTransferFailed(token, to, value);
        }
    }
}
