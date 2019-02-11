pragma solidity ^0.4.24;

// Interface for insurer's contract to interact with factory contract.
contract FactoryInterfaceC {
    function getContractAddress(uint _IDType, address _owner) public view returns (address);
}

// Interface for insurer's contract to interact with customer's contract.
contract CustInterface {
    function receiveClaim(
        uint _expiry, bytes32 _dataId, bytes32 _descr, bytes32 _verifierName, 
        address _verifier, bool _verified) public;
}

/** @title IdentityInsurer
  * @author Jo Moodley
  * @notice Self-sovereign identity demo for funeral insurance
  * @notice Contract for insurer's identity.
 */
contract IdentityInsurer {
    address private owner; // Insurer's identifier.
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

    // Structure for a customer.
    struct Customer {
        address identifier; // Address of customer.
        address dependent; // Address of dependent.
        Claim[] sharedClaims; // Array of claims shared with insurer.
    }

    Customer[] private customers; // Array of customers.
    mapping(address => uint) private customerIdToNum; // Maps customer's address to customer number.
    FactoryInterfaceC factoryContract; // Factory contract.

    event NewClaim(bytes32 _dataId); // To return data identifier when claim is created.

    // Constructor that only runs once when the contract is created.
    // Set owner of identity and factory contract.
    constructor(address _owner) public {
        owner = _owner;
        factoryContract = FactoryInterfaceC(msg.sender);
    }

    // Checks that caller is the owner of identity.
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // Add customer.
    function addCustomer() public {
        require(customerIdToNum[msg.sender] == 0);
        customers.length++;
        customers[customers.length - 1].identifier = msg.sender;
        customerIdToNum[msg.sender] = customers.length;
    }

    // Add dependent to customer.
    function addDependent(address _dependent) public {
        uint num = customerIdToNum[msg.sender];
        customers[num - 1].dependent = _dependent;
    }

    // Add shared claim from customer.
    function addSharedClaim(
        address _customer, uint _expiry, bytes32 _dataId, bytes32 _descr,  
        bytes32 _verifierName, address _verifier, bool _verified) public {
        address custContractAddress = factoryContract.getContractAddress(3, _customer);
        require(msg.sender == custContractAddress);
        uint num = customerIdToNum[_customer];
        Claim memory thisClaim = Claim(_expiry, _dataId, _descr, _verifierName, _verifier, _verified);
        customers[num - 1].sharedClaims.push(thisClaim);
    }

    // Add new claim for customer to array of shared claims and send to customer.
    function _addClaim(uint _customerNum, bytes32 _dataId, bytes32 _descr) private {
        Claim memory thisClaim = Claim(0, _dataId, _descr, "Insurer", owner, true);
        customers[_customerNum - 1].sharedClaims.push(thisClaim);
        address custContractAddress = factoryContract.getContractAddress(3, customers[_customerNum - 1].identifier);
        CustInterface custContract = CustInterface(custContractAddress);
        custContract.receiveClaim(0, _dataId, _descr, "Insurer", owner, true);
    }

    // Create claim for proof of funeral cover.
    function createFuneralPlan(
        uint _plan, uint _customerNum, uint _premium, uint _cover, uint _sundries, bytes32 _legal, 
        uint _waitPeriodDays, bytes32 _paymentHoliday, bytes32 _premiumPayback) public onlyOwner {
        claimNonce++;
        bytes32 dataId = keccak256(
            abi.encodePacked(_premium, _cover, _sundries, _legal, _waitPeriodDays, 
            _paymentHoliday, _premiumPayback, claimNonce));
        if (_plan == 2) {
            _addClaim(_customerNum, dataId, "Family Funeral Plan");
        } else {
            _addClaim(_customerNum, dataId, "Single Funeral Plan");
        }
        emit NewClaim(dataId);
    }

    // Get the number of customers.
    function getCustomerCount() public view onlyOwner returns (uint) {
        return customers.length;
    }

    // View a customer's information.
    function getCustomer(uint _index) public view onlyOwner returns (address, address) {
        return (customers[_index].identifier, customers[_index].dependent);
    }

    // Get the number of shared claims for a customer.
    function getCustomerClaimCount(uint _index) public view onlyOwner returns (uint) {
        return customers[_index].sharedClaims.length;
    }

    // View a shared claim for a customer.
    function getCustomerClaim(uint _indexA, uint _indexB) public view onlyOwner returns (
        uint, bytes32, bytes32, bytes32, address, bool) {
        Claim memory thisClaim = customers[_indexA].sharedClaims[_indexB];
        return (
            thisClaim.expiryDate, thisClaim.dataIdentifier, thisClaim.description, 
            thisClaim.verifierName, thisClaim.verifier, thisClaim.verified);
    }
}
