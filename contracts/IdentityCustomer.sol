pragma solidity ^0.4.24;

// Interface for customer's contract to interact with factory contract.
contract FactoryInterface {
    function getGovAddress() public view returns (address);
    function getContractAddress(uint _IDType, address _owner) public view returns (address);
}

// Interface for customer's contract to interact with government's contract.
contract GovInterface {
    function addVerificationRequest(
        address _requestor, uint _claimNum, uint _expiry, bytes32 _dataId, bytes32 _descr,  
        bytes32 _verifierName, address _verifier, bool _verified) public;
}

// Interface for customer's contract to interact with insurer's contract.
contract CorpInterface {
    function addSharedClaim(
        address _customer, uint _expiry, bytes32 _dataId, bytes32 _descr,  
        bytes32 _verifierName, address _verifier, bool _verified) public;
}

/** @title IdentityCustomer
  * @author Jo Moodley
  * @notice Self-sovereign identity demo for funeral insurance
  * @notice Contract for identities for customer and customer's relative.
 */
contract IdentityCustomer {
    address private owner; // Customer's identifier.
    uint private claimNonce = 0; // Used in hashing of claim data.

    // Structure for a claim.
    struct Claim {
        uint expiryDate; // Expiry date of claim.
        bytes32 dataIdentifier; // Claim data identifier.
        bytes32 description; // Description of claim.
        bytes32 verifierName; // Name of verifier.
        address verifier; // Address of verifier.
        bool verified; // Whether claim is verified or not.
    }

    Claim[] private claims; // Array of customer's claims.
    FactoryInterface factoryContract; // Factory contract.

    event NewClaim(bytes32 _dataId); // To return data identifier when claim is created.

    // Constructor that only runs once when the contract is created.
    // Set owner of identity and factory contract.
    constructor(address _owner) public {
        owner = _owner;
        factoryContract = FactoryInterface(msg.sender);
    }

    // Checks that caller is the owner of identity.
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // Add claim to array of claims.
    function _addClaim(bytes32 _dataId, bytes32 _descr, uint _expiry) private {
        address gov = factoryContract.getGovAddress();
        Claim memory thisClaim = Claim(_expiry, _dataId, _descr, "SA Government", gov, false);
        claims.push(thisClaim);
    }

    // Create claim for proof of identity.
    function createClaimID(
        uint _idnumber, bytes32 _name, uint _dob) public onlyOwner {
        claimNonce++;
        bytes32 dataId = keccak256(abi.encodePacked(_idnumber, _name, _dob, owner, claimNonce));
        _addClaim(dataId, "South African identity", 0);
        _requestVerification(claims.length);
        emit NewClaim(dataId);
    }

    // Create claim for proof of address.
    function createClaimAddress(
        bytes32 _line1, bytes32 _line2, bytes32 _town, bytes32 _country, uint _code, 
        uint _expiry) public onlyOwner {
        claimNonce++;
        bytes32 dataId = keccak256(abi.encodePacked(_line1, _line2, _town, _country, _code, owner, claimNonce));
        _addClaim(dataId, "Residential address", _expiry);
        _requestVerification(claims.length);
        emit NewClaim(dataId);
    }

    // Create claim for proof of age.
    function createClaimAge(uint _dob) public onlyOwner {
        claimNonce++;
        bytes32 dataId = keccak256(abi.encodePacked(_dob, owner, claimNonce));
        _addClaim(dataId, "Age over 18 years", 0);
        _requestVerification(claims.length);
        emit NewClaim(dataId);
    }

    // Request verification of claim from government.
    function _requestVerification(uint _claimNum) private {
        Claim memory thisClaim = claims[_claimNum - 1];
        address govContractAddress = factoryContract.getContractAddress(1, address(0));
        GovInterface govContract = GovInterface(govContractAddress);
        govContract.addVerificationRequest(
            owner, _claimNum, thisClaim.expiryDate, thisClaim.dataIdentifier, 
            thisClaim.description, thisClaim.verifierName, thisClaim.verifier, thisClaim.verified);
    }

    // Add verification of claim from government.
    function addVerification(uint _claimNum) public {
        address govContractAddress = factoryContract.getContractAddress(1, address(0));
        require(msg.sender == govContractAddress);
        claims[_claimNum - 1].verified = true;
    }

    // Share claim with insurer.
    function shareClaim(uint _claimNum) public onlyOwner {
        Claim memory thisClaim = claims[_claimNum - 1];
        address corpContractAddress = factoryContract.getContractAddress(2, address(0));
        CorpInterface corpContract = CorpInterface(corpContractAddress);
        corpContract.addSharedClaim(
            owner, thisClaim.expiryDate, thisClaim.dataIdentifier, 
            thisClaim.description, thisClaim.verifierName, thisClaim.verifier, thisClaim.verified);
    }

    // Add verified claim from insurer.
    function receiveClaim(
        uint _expiry, bytes32 _dataId, bytes32 _descr, bytes32 _verifierName, 
        address _verifier, bool _verified) public {
        address corpContractAddress = factoryContract.getContractAddress(2, address(0));
        require(msg.sender == corpContractAddress);
        Claim memory thisClaim = Claim(_expiry, _dataId, _descr, _verifierName, _verifier, _verified);
        claims.push(thisClaim);
    }

    // Get the number of claims.
    function getClaimCount() public view onlyOwner returns (uint) {
        return claims.length;
    }

    // View a claim.
    function getClaim(uint _index) public view onlyOwner returns (
        uint, bytes32, bytes32, bytes32, address, bool) {
        return (
            claims[_index].expiryDate, claims[_index].dataIdentifier, claims[_index].description,
            claims[_index].verifierName, claims[_index].verifier, claims[_index].verified);
    }
}
