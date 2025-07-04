// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserProfile {
    address public userOwner;
    address public serverOwner;
    string public userName;
    string public profilePicture;
    string public description;
    address[] public subscribedUsers;

    mapping(address => bool) public isSubscribed;

    event ProfileUpdated(
        string userName,
        string profilePicture,
        string description
    );
    event UserSubscribed(address indexed subscriber);
    event UserUnsubscribed(address indexed subscriber);

    modifier onlyUserOwner() {
        require(
            msg.sender == userOwner,
            "Only the owner can perform this action"
        );
        _;
    }

    modifier onlyServerOwner() {
        require(
            msg.sender == serverOwner,
            "Only the server owner can perform this action"
        );
        _;
    }

    constructor(address _userOwner, string memory _userName) {
        userOwner = _userOwner;
        serverOwner = msg.sender;
        userName = _userName;
    }

    function updateProfile(
        string memory _userName,
        string memory _profilePicture,
        string memory _description
    ) external onlyUserOwner {
        userName = _userName;
        profilePicture = _profilePicture;
        description = _description;

        emit ProfileUpdated(_userName, _profilePicture, _description);
    }

    function subscribe(address _subscriber) external {
        require(!isSubscribed[_subscriber], "User already subscribed");

        subscribedUsers.push(_subscriber);
        isSubscribed[_subscriber] = true;

        emit UserSubscribed(_subscriber);
    }

    function unsubscribe(address _subscriber) external {
        require(isSubscribed[_subscriber], "User not subscribed");

        for (uint i = 0; i < subscribedUsers.length; i++) {
            if (subscribedUsers[i] == _subscriber) {
                subscribedUsers[i] = subscribedUsers[
                    subscribedUsers.length - 1
                ];
                subscribedUsers.pop();
                break;
            }
        }

        isSubscribed[_subscriber] = false;

        emit UserUnsubscribed(_subscriber);
    }

    function getSubscribedUsers() external view returns (address[] memory) {
        return subscribedUsers;
    }

    function getSubscriberCount() external view returns (uint256) {
        return subscribedUsers.length;
    }
}

contract ProfileManager {
    address public serverOwner;

    mapping(address => address) public userProfiles;
    mapping(address => bool) public profileExists;

    address[] public allUsers;

    event ProfileCreated(
        address indexed userID,
        address profileContract,
        string userName
    );

    modifier onlyServerOwner() {
        require(
            msg.sender == serverOwner,
            "Only the server owner can perform this action"
        );
        _;
    }

    constructor() {
        serverOwner = msg.sender;
    }

    function createProfile(string memory _userName) external onlyServerOwner {
        require(
            !profileExists[msg.sender],
            "Profile already exists for this user"
        );
        require(bytes(_userName).length > 0, "Username required");

        UserProfile newProfile = new UserProfile(msg.sender, _userName);

        userProfiles[msg.sender] = address(newProfile);
        profileExists[msg.sender] = true;
        allUsers.push(msg.sender);

        emit ProfileCreated(msg.sender, address(newProfile), _userName);
    }

    function getUserProfile(address _userID) external view returns (address) {
        require(profileExists[_userID], "Profile does not exist");
        return userProfiles[_userID];
    }

    function getAllUsers() external view returns (address[] memory) {
        return allUsers;
    }

    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }

    function transferServerOwnership(
        address _newOwner
    ) external onlyServerOwner {
        require(_newOwner != address(0), "Invalid new address");
        serverOwner = _newOwner;
    }
}
