pragma solidity ^0.4.24;

// Interface for government's contract to interact with factory contract.
contract FactoryInterfaceG {
    function getContractAddress(uint _IDType, address _owner) public view returns (address);
}

// Interface for government's contract to interact with customer's contract.
contract CustInterfaceG {
    function addVerification(uint _claimNum) public;
}

/** @title IdentityGovernment
  * @author Jo Moodley
  * @notice Self-sovereign identity demo for funeral insurance
  * @notice Contract for government's identity.
 */
contract IdentityGovernment {
    address private owner; // Government's identifier.

    // Structure for a claim verification request.
    struct VerificationRequest {
        uint claimNum; // Requestor's claim number.
        uint expiryDate; // Expiry date of claim.
        bytes32 dataIdentifier; // Claim data identifier.
        bytes32 description; // Description of claim.
        bytes32 verifierName; // Name of verifier.
        address verifier; // Address of verifier.
        address requestor; // Address of requestor.
        bool verified; // Whether claim is verified or not.
    }

    VerificationRequest[] private verifRequests; // Array of requests to verify claims.
    FactoryInterfaceG factoryContract; // Factory contract.

    // Constructor that only runs once when the contract is created.
    // Set owner of identity and factory contract.
    constructor(address _owner) public {
        owner = _owner;
        factoryContract = FactoryInterfaceG(msg.sender);
    }

    // Checks that caller is the owner of identity.
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // Add request from customer to verify a claim.
    function addVerificationRequest(
        address _requestor, uint _claimNum, uint _expiry, bytes32 _dataId, bytes32 _descr,  
        bytes32 _verifierName, address _verifier, bool _verified) public {
        require(_verifier == owner);
        address reqContractAddress = factoryContract.getContractAddress(3, _requestor);
        require(msg.sender == reqContractAddress);
        VerificationRequest memory thisRequest = VerificationRequest(
            _claimNum, _expiry, _dataId, _descr, 
            _verifierName, _verifier, _requestor, _verified);
        verifRequests.push(thisRequest);
    }

    // Verify customer's claim and remove request from array.
    function verifyClaim(uint _requestNum) public onlyOwner {
        require(_requestNum > 0 && _requestNum <= verifRequests.length);
        address thisRequestor = verifRequests[_requestNum - 1].requestor;
        uint thisClaimNum = verifRequests[_requestNum - 1].claimNum;
        address reqContractAddress = factoryContract.getContractAddress(3, thisRequestor);
        CustInterfaceG reqContract = CustInterfaceG(reqContractAddress);
        reqContract.addVerification(thisClaimNum);
        for (uint i = _requestNum - 1; i < verifRequests.length - 1; i++) {
            verifRequests[i] = verifRequests[i + 1];
        }
        verifRequests.length--;
    }

    // Get the number of requests.
    function getVerifRequestCount() public view onlyOwner returns (uint) {
        return verifRequests.length;
    }

    // View a request.
    function getVerifRequest(uint _index) public view onlyOwner returns (
        address, uint, bytes32, bytes32, bytes32, address, bool) {
        VerificationRequest memory thisReq = verifRequests[_index];
        return (
            thisReq.requestor, thisReq.expiryDate, thisReq.dataIdentifier, 
            thisReq.description, thisReq.verifierName, thisReq.verifier, thisReq.verified);
    }
}