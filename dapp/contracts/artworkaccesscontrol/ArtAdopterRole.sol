pragma solidity ^0.5.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'ConsumerRole' to manage this role - add, remove, check
contract ArtAdopterRole {

    using Roles for Roles.Role;

    event ArtAdopterAdded(address indexed account);
    event ArtAdopterRemoved(address indexed account);

    // Define a struct 'artAdopters' by inheriting from 'Roles' library, struct Role
    Roles.Role private artAdopters;

    // In the constructor make the address that deploys this contract the 1st consumer
    constructor() public {
        _addAdopter(msg.sender);
    }

  // Define a modifier that checks to see if msg.sender has the appropriate role
    modifier onlyArtAdopter() {
        require(isAdopter(msg.sender));
        _;
    }

  // Define a function 'isAdopter' to check this role
    function isAdopter(address account) public view returns (bool) {
        return artAdopters.has(account);
    }

  // Define a function 'addAdopter' that adds this role
    function addAdopter(address account) public {
        _addAdopter(account);
    }

  // Define a function 'removeAdopter' to remove this role
    function removeAdopter() public {
        _removeAdopter(msg.sender);
    }

  // Define an internal function '_addAdopter' to add this role, called by 'addAdopter'
    function _addAdopter(address account) internal {
        artAdopters.add(account);
        emit ArtAdopterAdded(account);
    }

  // Define an internal function '_removeAdopter' to remove this role, called by 'removeAdopter'
    function _removeAdopter(address account) internal {
        artAdopters.remove(account);
        emit ArtAdopterRemoved(account);
    }
}