// ABI for the BulbProfile contract
export const BULB_PROFILE_ABI = [
    {
        "type": "function",
        "name": "updateProfile",
        "inputs": [
            {
                "name": "_username",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "_profilePicture",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "_description",
                "type": "string",
                "internalType": "string"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getProfileInfo",
        "inputs": [],
        "outputs": [
            {
                "name": "username",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "profilePicture",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "description",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "createdAt",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "updatedAt",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "creator",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "ProfileUpdated",
        "inputs": [
            {
                "name": "username",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            },
            {
                "name": "profilePicture",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            },
            {
                "name": "description",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            }
        ],
        "anonymous": false
    }
] as const;
