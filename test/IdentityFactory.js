// Import contracts.
var IdentityFactory = artifacts.require("./IdentityFactory.sol");
var IdentityGovernment = artifacts.require("./IdentityGovernment.sol");
var IdentityInsurer = artifacts.require("./IdentityInsurer.sol");
var IdentityCustomer = artifacts.require("./IdentityCustomer.sol");

// Test contracts.
contract("IdentityFactory", function(accounts) {
  var factoryInstance;
  var govInstance;
  var corpInstance;
  var custInstance;
  var idCount;

  it("initializes with no identities", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.identityCount();
    }).then(function(num) {
      assert.equal(num, 0, "initial identity count is not 0");
    });
  });

  it("creates an identity for government from accounts[0] with correct values", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.identityCount();
    }).then(function(num) {
      idCount = num.toNumber();
      return factoryInstance.createIdentity(1, {'from': accounts[0]});
    }).then(function(receipt) {
      assert.equal(receipt.logs[0].event.toString(), "NewIdentity", "event did not emit");
      return factoryInstance.identityCount();
    }).then(function(num) {
      assert.equal(num, idCount + 1, "number of identities has not increased");
      return factoryInstance.getContractAddress(1, accounts[0]);
    }).then(function(conAddress) {
      assert(conAddress != 0, "contract address is 0 when it should be a valid address");
      govInstance = IdentityGovernment.at(conAddress);
      return factoryInstance.ownerToIDType(accounts[0]);
    }).then(function(num) {
      assert.equal(num, 1, "identity type is not 1");
      return factoryInstance.getGovAddress();
    }).then(function(id) {
      assert.equal(id, accounts[0], "government ID is not correct");
      return factoryInstance.services(0);
    }).then(function(claim) {
      assert.equal(claim[0], accounts[0], "provider ID is not correct");
      assert.equal(web3.toUtf8(claim[1]), "SA Government", "provider name is not correct");
      assert.equal(web3.toUtf8(claim[2]), "Verifier", "service description is not correct");
      assert.equal(claim[3], 5550100, "contact number is not correct");
      return govInstance.getVerifRequestCount({'from': accounts[0]});
    }).then(function(num) {
      assert.equal(num, 0, "number of verification requests is not 0");
    });
  });

  it("creates an identity for insurer from accounts[1] with correct values", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.identityCount();
    }).then(function(num) {
      idCount = num.toNumber();
      return factoryInstance.createIdentity(2, {'from': accounts[1]});
    }).then(function(receipt) {
      assert.equal(receipt.logs[0].event.toString(), "NewIdentity", "event did not emit");
      return factoryInstance.identityCount();
    }).then(function(num) {
      assert.equal(num, idCount + 1, "number of identities has not increased");
      return factoryInstance.getContractAddress(2, accounts[1]);
    }).then(function(conAddress) {
      assert(conAddress != 0, "contract address is 0 when it should be a valid address");
      corpInstance = IdentityInsurer.at(conAddress);
      return factoryInstance.ownerToIDType(accounts[1]);
    }).then(function(num) {
      assert.equal(num, 2, "identity type is not 2");
      return factoryInstance.services(1);
    }).then(function(claim) {
      assert.equal(claim[0], accounts[1], "provider ID is not correct");
      assert.equal(web3.toUtf8(claim[1]), "Insurer", "provider name is not correct");
      assert.equal(web3.toUtf8(claim[2]), "Single Funeral Plan", "service description is not correct");
      assert.equal(claim[3], 5550101, "contact number is not correct");
      return factoryInstance.services(2);
    }).then(function(claim) {
      assert.equal(claim[0], accounts[1], "provider ID is not correct");
      assert.equal(web3.toUtf8(claim[1]), "Insurer", "provider name is not correct");
      assert.equal(web3.toUtf8(claim[2]), "Family Funeral Plan", "service description is not correct");
      assert.equal(claim[3], 5550102, "contact number is not correct");
      return corpInstance.getCustomerCount({'from': accounts[1]});
    }).then(function(num) {
      assert.equal(num, 0, "number of customers is not 0");
    });
  });

  it("fails if user tries to create a government identity that already exists", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.identityCount();
    }).then(function(num) {
      idCount = num.toNumber();
      return factoryInstance.createIdentity(1, {'from': accounts[2]});
    }).then(assert.fail).catch(function(error) {
      assert.include(error.message, 'revert', "error message must include revert");
      return factoryInstance.identityCount();
    }).then(function(num) {
      assert.equal(num, idCount, "number of identities has increased");
      return factoryInstance.getContractAddress(3, accounts[2]);
    }).then(function(conAddress) {
      assert(conAddress == 0, "contract address is not 0");
      return factoryInstance.getGovAddress();
    }).then(function(id) {
      assert.equal(id, accounts[0], "government ID is not correct");
    });
  });

  it("fails if user tries to create an insurer identity that already exists", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.identityCount();
    }).then(function(num) {
      idCount = num.toNumber();
      return factoryInstance.createIdentity(2, {'from': accounts[2]});
    }).then(assert.fail).catch(function(error) {
      assert.include(error.message, 'revert', "error message must include revert");
      return factoryInstance.identityCount();
    }).then(function(num) {
      assert.equal(num, idCount, "number of identities has increased");
      return factoryInstance.getContractAddress(3, accounts[2]);
    }).then(function(conAddress) {
      assert(conAddress == 0, "contract address is not 0");
    });
  });

  it("creates an identity for customer from accounts[2] with correct values", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.identityCount();
    }).then(function(num) {
      idCount = num.toNumber();
      return factoryInstance.createIdentity(3, {'from': accounts[2]});
    }).then(function(receipt) {
      assert.equal(receipt.logs[0].event.toString(), "NewIdentity", "event did not emit");
      return factoryInstance.identityCount();
    }).then(function(num) {
      assert.equal(num, idCount + 1, "number of identities has not increased");
      return factoryInstance.getContractAddress(3, accounts[2]);
    }).then(function(conAddress) {
      assert(conAddress != 0, "contract address is 0 when it should be a valid address");
      custInstance = IdentityCustomer.at(conAddress);
      return factoryInstance.ownerToIDType(accounts[2]);
    }).then(function(num) {
      assert.equal(num, 3, "identity type is not 3");
      return custInstance.getClaimCount({'from': accounts[2]});
    }).then(function(num) {
      assert.equal(num, 0, "number of claims is not 0");
    });
  });

  it("creates an identity for customer's relative from accounts[3] with correct values", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.identityCount();
    }).then(function(num) {
      idCount = num.toNumber();
      return factoryInstance.createIdentity(4, {'from': accounts[3]});
    }).then(function(receipt) {
      assert.equal(receipt.logs[0].event.toString(), "NewIdentity", "event did not emit");
      return factoryInstance.identityCount();
    }).then(function(num) {
      assert.equal(num, idCount + 1, "number of identities has not increased");
      return factoryInstance.getContractAddress(3, accounts[3]);
    }).then(function(conAddress) {
      assert(conAddress != 0, "contract address is 0 when it should be a valid address");
      custInstance = IdentityCustomer.at(conAddress);
      return factoryInstance.ownerToIDType(accounts[3]);
    }).then(function(num) {
      assert.equal(num, 4, "identity type is not 4");
      return custInstance.getClaimCount({'from': accounts[3]});
    }).then(function(num) {
      assert.equal(num, 0, "number of claims is not 0");
    });
  });

  it("fails if customer tries to create a second identity", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.identityCount();
    }).then(function(num) {
      idCount = num.toNumber();
      return factoryInstance.createIdentity(3, {'from': accounts[2]});
    }).then(assert.fail).catch(function(error) {
      assert.include(error.message, 'revert', "error message must include revert");
      return factoryInstance.identityCount();
    }).then(function(num) {
      assert.equal(num, idCount, "number of identities has increased");
    });
  });
  
  it("allows customer to create a proof of identity claim", function() {
    var idno = 9502010000000;
    var name = "John Doe";
    var dob = 19950201;

    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(3, accounts[2]);
    }).then(function(conAddress) {
      custInstance = IdentityCustomer.at(conAddress);
      return custInstance.createClaimID(idno, name, dob, {'from': accounts[2]});
    }).then(function(receipt) {
      assert.equal(receipt.logs[0].event.toString(), "NewClaim", "event did not emit");
      return custInstance.getClaimCount({'from': accounts[2]});
    }).then(function(num) {
      assert.equal(num, 1, "number of claims has not increased");
      return custInstance.getClaim(0, {'from': accounts[2]});
    }).then(function(claim) {
      assert.equal(claim[0], 0, "expiry date is not 0");
      assert(claim[1] != "0", "data identifier is 0");
      assert.equal(web3.toUtf8(claim[2]), "South African identity", "description is not correct");
      assert.equal(web3.toUtf8(claim[3]), "SA Government", "verifier name is not correct");
      assert.equal(claim[4], accounts[0], "verifier ID is not government ID");
      assert.equal(claim[5], false, "claim is not unverified");
    });
  });

  it("allows government to check and verify proof of identity claim for customer", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(1, accounts[0]);
    }).then(function(conAddress) {
      govInstance = IdentityGovernment.at(conAddress);
      return govInstance.getVerifRequestCount({'from': accounts[0]});
    }).then(function(num) {
      assert.equal(num, 1, "number of verification requests has not increased");
      return govInstance.getVerifRequest(0, {'from': accounts[0]});
    }).then(function(request) {
      assert.equal(request[0], accounts[2], "requestor is not correct");
      assert.equal(request[1], 0, "expiry date is not 0");
      assert(request[2] != "0", "data identifier is 0");
      assert.equal(web3.toUtf8(request[3]), "South African identity", "description is not correct");
      assert.equal(web3.toUtf8(request[4]), "SA Government", "verifier name is not correct");
      assert.equal(request[5], accounts[0], "verifier ID is not government ID");
      assert.equal(request[6], false, "claim is not unverified");
      return govInstance.verifyClaim(1, {'from': accounts[0]});
    }).then(function() {
      return govInstance.getVerifRequestCount({'from': accounts[0]});
    }).then(function(num) {
      assert.equal(num, 0, "number of verification requests has not decreased");
      return factoryInstance.getContractAddress(3, accounts[2]);
    }).then(function(conAddress) {
      custInstance = IdentityCustomer.at(conAddress);
      return custInstance.getClaim(0, {'from': accounts[2]});
    }).then(function(claim) {
      assert.equal(claim[5], true, "claim is not verified");
    });
  });

  it("produces a different data id if customer creates a duplicate proof of identity claim", function() {
    var idno = 9502010000000;
    var name = "John Doe";
    var dob = 19950201;
    var dataid;

    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(3, accounts[2]);
    }).then(function(conAddress) {
      custInstance = IdentityCustomer.at(conAddress);
      return custInstance.createClaimID(idno, name, dob, {'from': accounts[2]});
    }).then(function(receipt) {
      assert.equal(receipt.logs[0].event.toString(), "NewClaim", "event did not emit");
      return custInstance.getClaim(0, {'from': accounts[2]});
    }).then(function(claim) {
      dataid = claim[1];
      return custInstance.getClaim(1, {'from': accounts[2]});
    }).then(function(claimcopy) {
      assert(dataid != claimcopy[1], "data identifier is the same");
    });
  });

  it("allows customer to sign up to insurer", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(2, accounts[2]);
    }).then(function(conAddress) {
      corpInstance = IdentityInsurer.at(conAddress);
      return corpInstance.addCustomer({'from': accounts[2]});
    }).then(function() {
      return corpInstance.getCustomerCount({'from': accounts[1]});
    }).then(function(num) {
      assert.equal(num, 1, "number of customers has not increased");
      return corpInstance.getCustomer(0, {'from': accounts[1]});
    }).then(function(cust) {
      assert.equal(cust[0], accounts[2], "customer ID is not correct");
    });
  });

  it("allows customer to add relative as a dependent", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(2, accounts[2]);
    }).then(function(conAddress) {
      corpInstance = IdentityInsurer.at(conAddress);
      return corpInstance.addDependent(accounts[3], {'from': accounts[2]});
    }).then(function() {
      return corpInstance.getCustomer(0, {'from': accounts[1]});
    }).then(function(cust) {
      assert.equal(cust[1], accounts[3], "dependent ID is not correct");
    });
  });

  it("allows customer to share proof of identity claim with insurer", function() {
    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(3, accounts[2]);
    }).then(function(conAddress) {
      custInstance = IdentityCustomer.at(conAddress);
      return custInstance.shareClaim(1, {'from': accounts[2]});
    }).then(function() {
      return factoryInstance.getContractAddress(2, accounts[1]);
    }).then(function(conAddress) {
      corpInstance = IdentityInsurer.at(conAddress);
      return corpInstance.getCustomerClaimCount(0, {'from': accounts[1]});
    }).then(function(num) {
      assert.equal(num, 1, "number of shared claims has not increased");
      return corpInstance.getCustomerClaim(0, 0, {'from': accounts[1]});
    }).then(function(claim) {
      assert.equal(claim[0], 0, "expiry date is not 0");
      assert(claim[1] != "0", "data identifier is 0");
      assert.equal(web3.toUtf8(claim[2]), "South African identity", "description is not correct");
      assert.equal(web3.toUtf8(claim[3]), "SA Government", "verifier name is not correct");
      assert.equal(claim[4], accounts[0], "verifier ID is not government ID");
      assert.equal(claim[5], true, "claim is not verified");
    });
  });

  it("allows insurer to issue proof of Single Funeral Plan to customer", function() {
    var prem = 30;
    var cover = 20000;
    var sun = 1000;
    var legal = "Yes";
    var wait = 30;
    var payhol = "1 per yr"
    var payback = "5 after 5 yrs"

    return IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(2, accounts[1]);
    }).then(function(conAddress) {
      corpInstance = IdentityInsurer.at(conAddress);
      return corpInstance.createFuneralPlan(1, 1, prem, cover, sun, legal, wait, 
        payhol, payback, {'from': accounts[1]});
    }).then(function(receipt) {
      assert.equal(receipt.logs[0].event.toString(), "NewClaim", "event did not emit");
      return corpInstance.getCustomerClaimCount(0, {'from': accounts[1]});
    }).then(function(num) {
      assert.equal(num, 2, "number of shared claims has not increased");
      return corpInstance.getCustomerClaim(0, 1, {'from': accounts[1]});
    }).then(function(claim) {
      assert.equal(claim[0], 0, "expiry date is not 0");
      assert(claim[1] != "0", "data identifier is 0");
      assert.equal(web3.toUtf8(claim[2]), "Single Funeral Plan", "description is not correct");
      assert.equal(web3.toUtf8(claim[3]), "Insurer", "verifier name is not correct");
      assert.equal(claim[4], accounts[1], "verifier ID is not insurer ID");
      assert.equal(claim[5], true, "claim is not verified");
      return factoryInstance.getContractAddress(3, accounts[2]);
    }).then(function(conAddress) {
      custInstance = IdentityCustomer.at(conAddress);
      return custInstance.getClaim(2, {'from': accounts[2]});
    }).then(function(claim) {
      assert.equal(claim[0], 0, "expiry date is not 0");
      assert(claim[1] != "0", "data identifier is 0");
      assert.equal(web3.toUtf8(claim[2]), "Single Funeral Plan", "description is not correct");
      assert.equal(web3.toUtf8(claim[3]), "Insurer", "verifier name is not correct");
      assert.equal(claim[4], accounts[1], "verifier ID is not insurer ID");
      assert.equal(claim[5], true, "claim is not verified");
    });
  });

});

