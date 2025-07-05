// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BulbProfile is ReentrancyGuard {
    address public creator;
    address public factory;

    struct Subscription {
        uint256 price;
        uint256 duration;
        bool isActive;
        IERC20 token;
    }

    struct UserSubscription {
        uint256 expiresAt;
        bool isActive;
    }

    Subscription public subscription;
    mapping(address => UserSubscription) public userSubscriptions;
    mapping(address => uint256) public earnings;

    event SubscriptionUpdated(uint256 price, uint256 duration, address token);
    event UserSubscribed(address indexed user, uint256 expiresAt);
    event EarningsWithdrawn(
        address indexed creator,
        uint256 amount,
        address token
    );

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
        _;
    }

    constructor(address _creator) {
        creator = _creator;
        factory = msg.sender;
    }

    function setSubscription(
        uint256 _price,
        uint256 _duration,
        address _token
    ) external onlyCreator {
        require(_price > 0, "Price must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(_token != address(0), "Invalid token address");

        subscription = Subscription({
            price: _price,
            duration: _duration,
            isActive: true,
            token: IERC20(_token)
        });

        emit SubscriptionUpdated(_price, _duration, _token);
    }

    function subscribe() external payable nonReentrant {
        require(subscription.isActive, "Subscription not active");
        require(subscription.price > 0, "Subscription not configured");

        // Transfer tokens from subscriber to this contract
        require(
            subscription.token.transferFrom(
                msg.sender,
                address(this),
                subscription.price
            ),
            "Token transfer failed"
        );

        // Update user subscription
        uint256 newExpiresAt = block.timestamp + subscription.duration;
        if (
            userSubscriptions[msg.sender].isActive &&
            userSubscriptions[msg.sender].expiresAt > block.timestamp
        ) {
            // Extend existing subscription
            newExpiresAt =
                userSubscriptions[msg.sender].expiresAt +
                subscription.duration;
        }

        userSubscriptions[msg.sender] = UserSubscription({
            expiresAt: newExpiresAt,
            isActive: true
        });

        // Add to creator earnings
        earnings[address(subscription.token)] += subscription.price;

        emit UserSubscribed(msg.sender, newExpiresAt);
    }

    function isSubscribed(address user) external view returns (bool) {
        return
            userSubscriptions[user].isActive &&
            userSubscriptions[user].expiresAt > block.timestamp;
    }

    function withdraw(address tokenAddress) external onlyCreator nonReentrant {
        uint256 amount = earnings[tokenAddress];
        require(amount > 0, "No earnings to withdraw");

        earnings[tokenAddress] = 0;
        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(creator, amount), "Transfer failed");

        emit EarningsWithdrawn(creator, amount, tokenAddress);
    }

    function deactivateSubscription() external onlyCreator {
        subscription.isActive = false;
    }

    function getSubscriptionInfo()
        external
        view
        returns (uint256 price, uint256 duration, bool isActive, address token)
    {
        return (
            subscription.price,
            subscription.duration,
            subscription.isActive,
            address(subscription.token)
        );
    }
}

contract BulbFactory is Ownable, ReentrancyGuard {
    mapping(address => address) public userProfiles;
    address[] public allProfiles;

    event ProfileCreated(address indexed user, address indexed profile);

    constructor() Ownable(msg.sender) {
        // Le constructeur Ownable nécessite maintenant un paramètre initialOwner
        // msg.sender sera le propriétaire initial du contrat factory
    }

    function createProfile() external returns (address) {
        require(
            userProfiles[msg.sender] == address(0),
            "Profile already exists"
        );

        BulbProfile newProfile = new BulbProfile(msg.sender);
        address profileAddress = address(newProfile);

        userProfiles[msg.sender] = profileAddress;
        allProfiles.push(profileAddress);

        emit ProfileCreated(msg.sender, profileAddress);

        return profileAddress;
    }

    function getProfile(address user) external view returns (address) {
        return userProfiles[user];
    }

    function hasProfile(address user) external view returns (bool) {
        return userProfiles[user] != address(0);
    }

    function getAllProfiles() external view returns (address[] memory) {
        return allProfiles;
    }

    function getProfilesCount() external view returns (uint256) {
        return allProfiles.length;
    }
}
