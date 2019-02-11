pragma solidity ^0.4.24;

import "./IdentityGovernment.sol";
import "./IdentityInsurer.sol";
import "./IdentityCustomer.sol";

/** @title IdentityFactory
  * @author Jo Moodley
  * @notice Self-sovereign identity demo for funeral insurance
  * @notice Contract that creates identities for government, insurer, customer and customer's relative.
 */
contract IdentityFactory {
    address private government; // Government's identifier.
    address private insurer; // Insurer's identifier.
    uint public identityCount = 0; // Number of identities.

    // Structure for a claim on a service or product that a provider offers.
    struct ServiceClaim {
        address provider;
        bytes32 providerName;
        bytes32 description;
        uint contact;
    }

    ServiceClaim[] public services; // Service claims of providers.
    mapping(address => address) private ownerToContract; // Maps user's account address to user's contract address.
    mapping(address => uint) public ownerToIDType; // Maps user to type of identity.

    event NewIdentity(); // To notify app when identity is created.

    // Create identity for user.
    // Input _IDType 1 for government, 2 for insurer, 3 for customer, 4 for relative.
    function createIdentity(uint _IDType) public {
        require(ownerToContract[msg.sender] == address(0));
        if (_IDType == 1) {
            require(government == address(0));
            IdentityGovernment gov = new IdentityGovernment(msg.sender);
            ownerToContract[msg.sender] = address(gov);
            government = msg.sender;
            services.push(ServiceClaim(government, "SA Government", "Verifier", 5550100));
        } else if (_IDType == 2) {
            require(insurer == address(0));
            IdentityInsurer corp = new IdentityInsurer(msg.sender);
            ownerToContract[msg.sender] = address(corp);
            insurer = msg.sender;
            services.push(ServiceClaim(insurer, "Insurer", "Single Funeral Plan", 5550101));
            services.push(ServiceClaim(insurer, "Insurer", "Family Funeral Plan", 5550102));
        } else if (_IDType == 3 || _IDType == 4) {
            IdentityCustomer c = new IdentityCustomer(msg.sender);
            ownerToContract[msg.sender] = address(c);
        }
        if (ownerToContract[msg.sender] != address(0)) {
            ownerToIDType[msg.sender] = _IDType;
            identityCount++;
            emit NewIdentity();
        }
    }

    // Get the number of service claims.
    function getServiceCount() public view returns (uint) {
        return services.length;
    }

    // Get government's account address.
    function getGovAddress() public view returns (address) {
        return government;
    }

    // Get user's contract address.
    // Input _IDType 1 for government, _IDType 2 for insurer, or user's account address.
    function getContractAddress(uint _IDType, address _owner) public view returns (address) {
        if (_IDType == 1) {
            return ownerToContract[government];
        } else if (_IDType == 2) {
            return ownerToContract[insurer];
        } else {
            return ownerToContract[_owner];
        }
    }
}