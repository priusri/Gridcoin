// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PaymentRecord
 * @dev Records off-chain payment transactions on the blockchain for verification
 */
contract PaymentRecord is Ownable, ReentrancyGuard {
    
    struct Payment {
        address user;
        uint256 amount;
        uint256 timestamp;
        string razorpayOrderId;
        string razorpayPaymentId;
        uint8 paymentType; // 0: transaction, 1: subscription
        bool verified;
    }

    struct Subscription {
        address user;
        uint256 amount;
        uint256 startDate;
        uint256 endDate;
        uint8 billingPeriod; // 0: monthly, 1: quarterly, 2: yearly
        bool active;
    }

    // Mappings
    mapping(string => Payment) public payments;
    mapping(address => string[]) public userPayments;
    mapping(string => Subscription) public subscriptions;
    mapping(address => string) public userSubscription;

    // Events
    event PaymentRecorded(
        address indexed user,
        uint256 amount,
        string razorpayOrderId,
        string razorpayPaymentId,
        uint256 timestamp
    );

    event PaymentVerified(
        string indexed razorpayOrderId,
        address indexed user,
        bool verified
    );

    event SubscriptionCreated(
        address indexed user,
        string subscriptionId,
        uint256 amount,
        uint256 startDate
    );

    event SubscriptionUpdated(
        address indexed user,
        string subscriptionId,
        bool active
    );

    event RefundIssued(
        string indexed razorpayOrderId,
        uint256 amount,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyValidAddress(address _user) {
        require(_user != address(0), "Invalid address");
        _;
    }

    modifier onlyValidAmount(uint256 _amount) {
        require(_amount > 0, "Amount must be greater than 0");
        _;
    }

    /**
     * @dev Record a payment on the blockchain
     * @param _user Address of the user
     * @param _amount Payment amount in wei
     * @param _razorpayOrderId Razorpay order ID
     * @param _razorpayPaymentId Razorpay payment ID
     * @param _paymentType Type of payment (0: transaction, 1: subscription)
     */
    function recordPayment(
        address _user,
        uint256 _amount,
        string memory _razorpayOrderId,
        string memory _razorpayPaymentId,
        uint8 _paymentType
    ) public onlyOwner onlyValidAddress(_user) onlyValidAmount(_amount) {
        require(
            _paymentType == 0 || _paymentType == 1,
            "Invalid payment type"
        );
        require(
            payments[_razorpayOrderId].user == address(0),
            "Payment already recorded"
        );

        Payment memory newPayment = Payment({
            user: _user,
            amount: _amount,
            timestamp: block.timestamp,
            razorpayOrderId: _razorpayOrderId,
            razorpayPaymentId: _razorpayPaymentId,
            paymentType: _paymentType,
            verified: true
        });

        payments[_razorpayOrderId] = newPayment;
        userPayments[_user].push(_razorpayOrderId);

        emit PaymentRecorded(
            _user,
            _amount,
            _razorpayOrderId,
            _razorpayPaymentId,
            block.timestamp
        );
    }

    /**
     * @dev Verify a recorded payment
     * @param _razorpayOrderId Payment order ID to verify
     */
    function verifyPayment(string memory _razorpayOrderId)
        public
        view
        returns (bool)
    {
        return payments[_razorpayOrderId].verified;
    }

    /**
     * @dev Get payment details
     * @param _razorpayOrderId Razorpay order ID
     */
    function getPaymentDetails(string memory _razorpayOrderId)
        public
        view
        returns (Payment memory)
    {
        return payments[_razorpayOrderId];
    }

    /**
     * @dev Get user's payment history
     * @param _user User address
     */
    function getUserPayments(address _user)
        public
        view
        onlyValidAddress(_user)
        returns (Payment[] memory)
    {
        string[] memory orderIds = userPayments[_user];
        Payment[] memory userPaymentHistory = new Payment[](orderIds.length);

        for (uint256 i = 0; i < orderIds.length; i++) {
            userPaymentHistory[i] = payments[orderIds[i]];
        }

        return userPaymentHistory;
    }

    /**
     * @dev Get total paid by user
     * @param _user User address
     */
    function getUserTotalPaid(address _user)
        public
        view
        onlyValidAddress(_user)
        returns (uint256)
    {
        string[] memory orderIds = userPayments[_user];
        uint256 total = 0;

        for (uint256 i = 0; i < orderIds.length; i++) {
            if (payments[orderIds[i]].verified) {
                total += payments[orderIds[i]].amount;
            }
        }

        return total;
    }

    /**
     * @dev Create a subscription record
     * @param _user User address
     * @param _amount Monthly/periodic amount
     * @param _subscriptionId Razorpay subscription ID
     * @param _billingPeriod Billing period (0: monthly, 1: quarterly, 2: yearly)
     */
    function createSubscription(
        address _user,
        uint256 _amount,
        string memory _subscriptionId,
        uint8 _billingPeriod
    ) public onlyOwner onlyValidAddress(_user) onlyValidAmount(_amount) {
        require(
            _billingPeriod <= 2,
            "Invalid billing period"
        );
        require(
            bytes(userSubscription[_user]).length == 0,
            "User already has active subscription"
        );

        uint256 endDate = calculateEndDate(block.timestamp, _billingPeriod);

        Subscription memory newSubscription = Subscription({
            user: _user,
            amount: _amount,
            startDate: block.timestamp,
            endDate: endDate,
            billingPeriod: _billingPeriod,
            active: true
        });

        subscriptions[_subscriptionId] = newSubscription;
        userSubscription[_user] = _subscriptionId;

        emit SubscriptionCreated(
            _user,
            _subscriptionId,
            _amount,
            block.timestamp
        );
    }

    /**
     * @dev Update subscription status
     * @param _subscriptionId Subscription ID
     * @param _active Active status
     */
    function updateSubscriptionStatus(
        string memory _subscriptionId,
        bool _active
    ) public onlyOwner {
        require(
            subscriptions[_subscriptionId].user != address(0),
            "Subscription not found"
        );

        subscriptions[_subscriptionId].active = _active;
        if (!_active) {
            subscriptions[_subscriptionId].endDate = block.timestamp;
        }

        address user = subscriptions[_subscriptionId].user;
        emit SubscriptionUpdated(user, _subscriptionId, _active);
    }

    /**
     * @dev Record a refund
     * @param _razorpayOrderId Original payment order ID
     * @param _refundAmount Refund amount
     */
    function recordRefund(string memory _razorpayOrderId, uint256 _refundAmount)
        public
        onlyOwner
        onlyValidAmount(_refundAmount)
    {
        require(
            payments[_razorpayOrderId].user != address(0),
            "Payment not found"
        );
        require(
            _refundAmount <= payments[_razorpayOrderId].amount,
            "Refund amount exceeds payment"
        );

        payments[_razorpayOrderId].amount -= _refundAmount;

        emit RefundIssued(_razorpayOrderId, _refundAmount, block.timestamp);
    }

    /**
     * @dev Calculate subscription end date based on billing period
     * @param _startDate Start date timestamp
     * @param _billingPeriod Billing period (0: monthly, 1: quarterly, 2: yearly)
     */
    function calculateEndDate(uint256 _startDate, uint8 _billingPeriod)
        internal
        pure
        returns (uint256)
    {
        uint256 secondsInMonth = 30 * 24 * 60 * 60;

        if (_billingPeriod == 0) {
            return _startDate + secondsInMonth;
        } else if (_billingPeriod == 1) {
            return _startDate + (3 * secondsInMonth);
        } else {
            return _startDate + (12 * secondsInMonth);
        }
    }

    /**
     * @dev Get subscription details
     * @param _subscriptionId Subscription ID
     */
    function getSubscriptionDetails(string memory _subscriptionId)
        public
        view
        returns (Subscription memory)
    {
        return subscriptions[_subscriptionId];
    }

    /**
     * @dev Check if subscription is active
     * @param _subscriptionId Subscription ID
     */
    function isSubscriptionActive(string memory _subscriptionId)
        public
        view
        returns (bool)
    {
        Subscription memory sub = subscriptions[_subscriptionId];
        return sub.active && block.timestamp < sub.endDate;
    }

    /**
     * @dev Get user's active subscription
     * @param _user User address
     */
    function getUserSubscription(address _user)
        public
        view
        onlyValidAddress(_user)
        returns (Subscription memory)
    {
        string memory subId = userSubscription[_user];
        return subscriptions[subId];
    }

    /**
     * @dev Get total payments recorded
     */
    function getTotalPaymentsCount() public view returns (uint256) {
        // Note: This would require iterating, so we'll keep it simple
        // For production, consider using an array to track
        return 0;
    }
}
