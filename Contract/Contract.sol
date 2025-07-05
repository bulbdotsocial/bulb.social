// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BulbProfile is ReentrancyGuard {
    address public creator;
    address public factory;
    
    struct ProfileInfo {
        string username;
        string profilePicture; // IPFS hash
        string description;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct Subscription {
        uint256 price;
        uint256 duration;
        bool isActive;
    }
    
    struct UserSubscription {
        uint256 expiresAt;
        bool isActive;
    }
    
    ProfileInfo public profileInfo;
    Subscription public subscription;
    mapping(address => UserSubscription) public userSubscriptions;
    uint256 public earnings;
    
    event ProfileUpdated(string username, string profilePicture, string description);
    event SubscriptionUpdated(uint256 price, uint256 duration);
    event UserSubscribed(address indexed user, uint256 expiresAt);
    event EarningsWithdrawn(address indexed creator, uint256 amount);
    event SubscriptionDeactivated();
    
    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
        _;
    }
    
    constructor(
        address _creator,
        string memory _username,
        string memory _profilePicture,
        string memory _description
    ) {
        creator = _creator;
        factory = msg.sender;
        
        profileInfo = ProfileInfo({
            username: _username,
            profilePicture: _profilePicture,
            description: _description,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        emit ProfileUpdated(_username, _profilePicture, _description);
    }
    
    function updateProfile(
        string memory _username,
        string memory _profilePicture,
        string memory _description
    ) external onlyCreator {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_username).length <= 50, "Username too long");
        require(bytes(_description).length <= 500, "Description too long");
        
        profileInfo.username = _username;
        profileInfo.profilePicture = _profilePicture;
        profileInfo.description = _description;
        profileInfo.updatedAt = block.timestamp;
        
        emit ProfileUpdated(_username, _profilePicture, _description);
    }
    
    function setSubscription(
        uint256 _price,
        uint256 _duration
    ) external onlyCreator {
        require(_price > 0, "Price must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        subscription = Subscription({
            price: _price,
            duration: _duration,
            isActive: true
        });
        
        emit SubscriptionUpdated(_price, _duration);
    }
    
    function subscribe() external payable nonReentrant {
        require(subscription.isActive, "Subscription not active");
        require(subscription.price > 0, "Subscription not configured");
        require(msg.value == subscription.price, "Incorrect payment amount");
        
        // Update user subscription
        uint256 newExpiresAt = block.timestamp + subscription.duration;
        if (userSubscriptions[msg.sender].isActive && userSubscriptions[msg.sender].expiresAt > block.timestamp) {
            // Extend existing subscription
            newExpiresAt = userSubscriptions[msg.sender].expiresAt + subscription.duration;
        }
        
        userSubscriptions[msg.sender] = UserSubscription({
            expiresAt: newExpiresAt,
            isActive: true
        });
        
        // Add to creator earnings
        earnings += msg.value;
        
        emit UserSubscribed(msg.sender, newExpiresAt);
    }
    
    function isSubscribed(address user) external view returns (bool) {
        return userSubscriptions[user].isActive && 
               userSubscriptions[user].expiresAt > block.timestamp;
    }
    
    function canAccessContent(address user) external view returns (bool) {
        // Creator can always access their own content
        if (user == creator) {
            return true;
        }
        
        return this.isSubscribed(user);
    }
    
    function withdraw() external onlyCreator nonReentrant {
        uint256 amount = earnings;
        require(amount > 0, "No earnings to withdraw");
        
        earnings = 0;
        (bool success, ) = creator.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit EarningsWithdrawn(creator, amount);
    }
    
    function deactivateSubscription() external onlyCreator {
        require(subscription.isActive, "Subscription already deactivated");
        
        subscription.isActive = false;
        
        emit SubscriptionDeactivated();
    }
    
    function getProfileInfo() external view returns (
        string memory username,
        string memory profilePicture,
        string memory description,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        return (
            profileInfo.username,
            profileInfo.profilePicture,
            profileInfo.description,
            profileInfo.createdAt,
            profileInfo.updatedAt
        );
    }
    
    function getSubscriptionInfo() external view returns (
        uint256 price,
        uint256 duration,
        bool isActive
    ) {
        return (
            subscription.price,
            subscription.duration,
            subscription.isActive
        );
    }
}

contract BulbFactory is Ownable, ReentrancyGuard {
    mapping(address => address) public userProfiles;
    address[] public allProfiles;
    
    event ProfileCreated(address indexed user, address indexed profile, string username);
    
    constructor() Ownable(msg.sender) {
        // Le constructeur Ownable nécessite maintenant un paramètre initialOwner
        // msg.sender sera le propriétaire initial du contrat factory
    }
    
    function createProfile(
        string memory _username,
        string memory _profilePicture,
        string memory _description
    ) external returns (address) {
        require(userProfiles[msg.sender] == address(0), "Profile already exists");
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_username).length <= 50, "Username too long");
        require(bytes(_description).length <= 500, "Description too long");
        
        BulbProfile newProfile = new BulbProfile(
            msg.sender,
            _username,
            _profilePicture,
            _description
        );
        address profileAddress = address(newProfile);
        
        userProfiles[msg.sender] = profileAddress;
        allProfiles.push(profileAddress);
        
        emit ProfileCreated(msg.sender, profileAddress, _username);
        
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
