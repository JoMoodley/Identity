App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3.
    if (typeof web3 !== 'undefined') {
      // If available, use web3 object provided by MetaMask.
      App.web3Provider = web3.currentProvider;
    } else {
      // Create a new provider. Here localhost is Ganache.
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      // Instantiate a new web3 object.
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("IdentityFactory.json", function(IdentityFactoryArtifact) {
      // Instantiate a new truffle contract from the factory contract artifact file.
      App.contracts.IdentityFactory = TruffleContract(IdentityFactoryArtifact);
      // Set the provider to interact with contract.
      App.contracts.IdentityFactory.setProvider(App.web3Provider);
    });

    $.getJSON("IdentityGovernment.json", function(IdentityGovernmentArtifact) {
      // Instantiate a new truffle contract from the government contract artifact file.
      App.contracts.IdentityGovernment = TruffleContract(IdentityGovernmentArtifact);
      // Set the provider to interact with contract.
      App.contracts.IdentityGovernment.setProvider(App.web3Provider);
    });

    $.getJSON("IdentityInsurer.json", function(IdentityInsurerArtifact) {
      // Instantiate a new truffle contract from the insurer contract artifact file.
      App.contracts.IdentityInsurer = TruffleContract(IdentityInsurerArtifact);
      // Set the provider to interact with contract.
      App.contracts.IdentityInsurer.setProvider(App.web3Provider);
    });

    $.getJSON("IdentityCustomer.json", function(IdentityCustomerArtifact) {
      // Instantiate a new truffle contract from the customer contract artifact file.
      App.contracts.IdentityCustomer = TruffleContract(IdentityCustomerArtifact);
      // Set the provider to interact with contract.
      App.contracts.IdentityCustomer.setProvider(App.web3Provider);
    });

    App.updateAccount();
    App.listenForEvents();
    return App.login();
  },

  // Function to update account.
  updateAccount: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
      }
    });
  },

  // Function to listen for event emitted in factory contract when new identity is created.
  listenForEvents: function() {
    App.contracts.IdentityFactory.deployed().then(function(instance) {
      instance.NewIdentity().watch(function(err, result) {
        if (err) {
          console.log(err);
        }
        App.login();
      });
    });
  },

  // Function to create an identity for user.
  // Input num 1 for government, 2 for insurer, 3 for customer, 4 for relative.
  register: function(num) {
    App.updateAccount();

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      return instance.createIdentity(num, {from: App.account});
    }).then(function() {
    }).catch(function(err) {
      console.log(err);
    });
  },

  // Function to login to system and render different content for each entity.
  login: function() {
    var factoryInstance;

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.identityCount();
    }).then(function(result) {
      $("#identityCount").html("Identity count: " + result);
      if (result >= 1) {
        App.factoryDisplayServices(); // Display provider service claims.
        $("#accountAddress").html("Account ID: " + App.account);
        factoryInstance.ownerToIDType(App.account).then(function(identityType) {

          if (identityType == 1) {
            // Government is logged in.
            $("#customer").hide();
            $("#insurer").hide();
            $("#government").show();
            $("#accountName").html("Logged in as: Government");
            App.govDisplayRequests();
          } else if (identityType == 2) {
            // Insurer is logged in.
            $("#customer").hide();
            $("#government").hide();
            $("#insurer").show();
            $("#accountName").html("Logged in as: Insurer");
            App.corpDisplayCustomers();
          } else if (identityType == 3) {
            // Customer is logged in.
            $("#insurer").hide();
            $("#government").hide();
            $("#customer").show();
            $("#accountName").html("Logged in as: Customer");
            App.customerDisplayClaims();
          } else if (identityType == 4) {
            // Customer's relative is logged in.
            $("#insurer").hide();
            $("#government").hide();
            $("#customer").show();
            $("#accountName").html("Logged in as: Relative");
            App.customerDisplayClaims();
          }

        });
        //$("#setup").hide();
        //$("#account").show();
      }
    }).catch(function(err) {
      console.log(err);
    });
  },
  
  // Function to display service claims of government and insurer.
  factoryDisplayServices: function() {
    var factoryInstance;

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getServiceCount();
    }).then(function(itemCount) {
      var itemTable = $("#servicesTable");
      itemTable.empty();

      // Loop through array of service claims and append it to table.
      // web3.toUtf8 converts bytes32 variable to string.
      for (var i = 0; i < itemCount; i++) {
        factoryInstance.services(i).then(function(item) {
          var address = item[0];
          var name = web3.toUtf8(item[1]);
          var descr = web3.toUtf8(item[2]);
          var contact = item[3];

          var itemRow = "<tr><td>" + address + "</td><td>" + name + "</td><td>" + descr +
            "</td><td>" + contact + "</td></tr>";

          itemTable.append(itemRow);
        });
      }
    }).catch(function(err) {
      console.log(err);
    });
  },

  // Function to display customer's claims.
  customerDisplayClaims: function() {
    var factoryInstance;
    var customerInstance;

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(3, App.account);
    }).then(function(conAddress) {
      customerInstance = App.contracts.IdentityCustomer.at(conAddress);
      return customerInstance.getClaimCount({from: App.account});
    }).then(function(itemCount) {
      var itemTable = $("#claimsTable");
      var k = 1;
      itemTable.empty();

      // Loop through array of claims and append it to table.
      for (var i = 0; i < itemCount; i++) {
        customerInstance.getClaim(i, {from: App.account}).then(function(item) {
          var expiry = item[0];
          var dataID = item[1];
          var descr = web3.toUtf8(item[2]);
          var verifierName = web3.toUtf8(item[3]);
          var verifierID = item[4];
          var verified = item[5];

          var itemRow = "<tr><td>" + k + "</td><td>" + descr + "</td><td>" + expiry + 
            "</td><td>" + verified + "</td><td>" + verifierName + "</td><td class='str-break'>" + verifierID + 
            "</td><td class='str-break'>" + dataID + "</td></tr>";

          itemTable.append(itemRow);
          k++;
        });
      }
    }).catch(function(err) {
      console.log(err);
    });
  },

  // Function to display government's verification requests.
  govDisplayRequests: function() {
    var factoryInstance;
    var govInstance;

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(1, App.account);
    }).then(function(conAddress) {
      govInstance = App.contracts.IdentityGovernment.at(conAddress);
      return govInstance.getVerifRequestCount({from: App.account});
    }).then(function(itemCount) {
      var itemTable = $("#verificationsTable");
      itemTable.empty();
      var k = 1;

      // Loop through array of verification requests and append it to table.
      for (var i = 0; i < itemCount; i++) {
        govInstance.getVerifRequest(i, {from: App.account}).then(function(item) {
          var requestor = item[0];
          var expiry = item[1];
          var dataID = item[2];
          var descr = web3.toUtf8(item[3]);
          var verifierName = web3.toUtf8(item[4]);
          var verifierID = item[5];
          var verified = item[6];

          var itemRow = "<tr><td>" + k + "</td><td class='str-break'>" + requestor + "</td><td>" + descr + 
            "</td><td>" + expiry + "</td><td>" + verified + "</td><td>" + verifierName + 
            "</td><td class='str-break'>" + verifierID + "</td><td class='str-break'>" + dataID + "</td></tr>";

          itemTable.append(itemRow);
          k++;
        });
      }
    }).catch(function(err) {
      console.log(err);
    });
  },

  // Function to display insurer's customers.
  corpDisplayCustomers: function() {
    var factoryInstance;
    var corpInstance;

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(2, App.account);
    }).then(function(conAddress) {
      corpInstance = App.contracts.IdentityInsurer.at(conAddress);
      return corpInstance.getCustomerCount({from: App.account});
    }).then(function(itemCount) {
      var itemTable = $("#customersTable");
      var k = 1;
      itemTable.empty();

      // Loop through array of customers and append it to table.
      for (var i = 0; i < itemCount; i++) {
        corpInstance.getCustomer(i, {from: App.account}).then(function(item) {
          var custID = item[0];
          var depID = item[1];

          var itemRow = "<tr><td>" + k + "</td><td>" + custID + "</td><td>" + depID + "</td></tr>";

          itemTable.append(itemRow);
          k++;
        });
      }
    }).catch(function(err) {
      console.log(err);
    });
  },

  // Function to output claim data.
  outputData: function(content, fileName, contentType) {
    var fileBlob = new Blob([content], {type:contentType});
    var fileURL = window.URL.createObjectURL(fileBlob);

    var file = document.createElement("a");
    file.download = fileName;
    file.href = fileURL;
    file.click();
  },

  // Customer function - Create claim for proof of identity.
  customerCreateClaimID: function() {
    var factoryInstance;
    var customerInstance;
    var data = [parseInt($("#idno").val()), $("#name").val(), parseInt($("#dob").val())];
    var claimObj = {
      "Data ID": "None",
      "ID number": data[0],
      "Name": data[1],
      "Date of birth": data[2]
    };

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(3, App.account);
    }).then(function(conAddress) {
      customerInstance = App.contracts.IdentityCustomer.at(conAddress);
      return customerInstance.createClaimID(data[0], data[1], data[2], {from: App.account});
    }).then(function() {
    }).then(function() {
      // Listen for event emitted when new claim is created.
      customerInstance.NewClaim().watch(function(error, result) {
        if (!error) {
          // Add data identifier to data object, convert data object to JSON and output it as text file.
          claimObj["Data ID"] = result.args._dataId;
          var claimJSON = JSON.stringify(claimObj);
          App.outputData(claimJSON, "Claim_ID.json", "text/plain");
          customerInstance.NewClaim().stopWatching();
        } else {
          console.log(error);
        }
      });
    }).catch(function(err) {
      console.log(err);
    });
  }, 

  // Customer function - Create claim for proof of address.
  customerCreateClaimAddress: function() {
    var factoryInstance;
    var customerInstance;
    var data = [$("#line1").val(), $("#line2").val(), $("#town").val(), $("#country").val(), 
      parseInt($("#pos").val()), parseInt($("#expiry").val())];
    var claimObj = {
      "Data ID": "None",
      "Line 1": data[0],
      "Line 2": data[1],
      "Town": data[2],
      "Country": data[3],
      "Postal code": data[4],
      "Expiry date": data[5]
    };

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(3, App.account);
    }).then(function(conAddress) {
      customerInstance = App.contracts.IdentityCustomer.at(conAddress);
      return customerInstance.createClaimAddress(data[0], data[1], data[2], data[3], data[4],
        data[5], {from: App.account});
    }).then(function() {
    }).then(function() {
      // Listen for event emitted when new claim is created.
      customerInstance.NewClaim().watch(function(error, result) {
        if (!error) {
          // Add data identifier to data object, convert data object to JSON and output it as text file.
          claimObj["Data ID"] = result.args._dataId;
          var claimJSON = JSON.stringify(claimObj);
          App.outputData(claimJSON, "Claim_Address.json", "text/plain");
          customerInstance.NewClaim().stopWatching();
        } else {
          console.log(error);
        }
      });
    }).catch(function(err) {
      console.log(err);
    });
  }, 

  // Customer function - Create claim for proof of age.
  customerCreateClaimAge: function() {
    var factoryInstance;
    var customerInstance;
    var data = parseInt($("#dob2").val());
    var claimObj = {
      "Data ID": "None",
      "Date of birth": data
    };

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(3, App.account);
    }).then(function(conAddress) {
      customerInstance = App.contracts.IdentityCustomer.at(conAddress);
      return customerInstance.createClaimAge(data, {from: App.account});
    }).then(function() {
    }).then(function() {
      // Listen for event emitted when new claim is created.
      customerInstance.NewClaim().watch(function(error, result) {
        if (!error) {
          // Add data identifier to data object, convert data object to JSON and output it as text file.
          claimObj["Data ID"] = result.args._dataId;
          var claimJSON = JSON.stringify(claimObj);
          App.outputData(claimJSON, "Claim_Date_of_birth.json", "text/plain");
          customerInstance.NewClaim().stopWatching();
        } else {
          console.log(error);
        }
      });
    }).catch(function(err) {
      console.log(err);
    });
  },

  // Customer function - Sign up as insurer's customer.
  customerSignUp: function() {
    var factoryInstance;
    var corpInstance;

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(2, '0x0');
    }).then(function(conAddress) {
      corpInstance = App.contracts.IdentityInsurer.at(conAddress);
      return corpInstance.addCustomer({from: App.account});
    }).then(function() {
    }).catch(function(err) {
      console.log(err);
    });
  },

  // Customer function - Add dependent to record in insurer's contract.
  customerAddDependent: function() {
    var factoryInstance;
    var corpInstance;
    var dependent = $("#dependent").val();

    if (dependent.trim() == "") {
      return false;
    }

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(2, '0x0');
    }).then(function(conAddress) {
      corpInstance = App.contracts.IdentityInsurer.at(conAddress);
      return corpInstance.addDependent(dependent, {from: App.account});
    }).then(function() {
    }).catch(function(err) {
      console.log(err);
    });
  },

  // Customer function - Share a claim with insurer.
  customerShareClaim: function() {
    var factoryInstance;
    var customerInstance;
    var claimNum = parseInt($("#claimNum").val());

    if (claimNum <= 0) {
      return false;
    }

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(3, App.account);
    }).then(function(conAddress) {
      customerInstance = App.contracts.IdentityCustomer.at(conAddress);
      return customerInstance.shareClaim(claimNum, {from: App.account});
    }).then(function() {
    }).catch(function(err) {
      console.log(err);
    });
  },

  // Government function - Verify a claim.
  govVerifyClaim: function() {
    var factoryInstance;
    var govInstance;
    var verifNum = parseInt($("#verifNum").val());

    if (verifNum <= 0) {
      return false;
    }

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(1, App.account);
    }).then(function(conAddress) {
      govInstance = App.contracts.IdentityGovernment.at(conAddress);
      return govInstance.verifyClaim(verifNum, {from: App.account});
    }).then(function() {
    }).catch(function(err) {
      console.log(err);
    });
  },

  // Insurer function - Display customer's shared claims.
  corpDisplaySharedClaims: function() {
    var factoryInstance;
    var corpInstance;
    var custIndex = parseInt($("#custNum").val())-1;

    if (custIndex < 0) {
      return false;
    }

    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(2, App.account);
    }).then(function(conAddress) {
      corpInstance = App.contracts.IdentityInsurer.at(conAddress);
      return corpInstance.getCustomer(custIndex, {from: App.account});
    }).then(function(item) {
      $("#custAddress").html("Customer ID: " + item[0]);
      return corpInstance.getCustomerClaimCount(custIndex, {from: App.account});
    }).then(function(itemCount) {
      var itemTable = $("#sharedClaimsTable");
      itemTable.empty();

      // Loop through array of shared claims for customer and append it to table.
      for (var i = 0; i < itemCount; i++) {
        corpInstance.getCustomerClaim(custIndex, i, {from: App.account}).then(function(item) {
          var expiry = item[0];
          var dataID = item[1];
          var descr = web3.toUtf8(item[2]);
          var verifierName = web3.toUtf8(item[3]);
          var verifierID = item[4];
          var verified = item[5];

          var itemRow = "<tr><td>" + descr + "</td><td>" + expiry + "</td><td>" + verified + 
            "</td><td>" + verifierName + "</td><td class='str-break'>" + verifierID + 
            "</td><td class='str-break'>" + dataID + "</td></tr>";

          itemTable.append(itemRow);
        });
      }
    }).catch(function(err) {
      console.log(err);
    });
  },

  // Insurer function - Create claim for proof of funeral cover.
  // Input plan 1 for Single Funeral Plan and 2 for Family Funeral Plan.
  corpCreateFuneralPlan: function(plan) {
    var factoryInstance;
    var corpInstance;
    
    if (plan == 2) {
      var custNum = parseInt($("#custNum3").val());
      var data = [parseInt($("#prem2").val()), parseInt($("#cover2").val()), parseInt($("#sun2").val()), 
      $("#legal2").val(), parseInt($("#wait2").val()), $("#payhol2").val(), $("#payback2").val()];
    } else {
      var custNum = parseInt($("#custNum2").val());
      var data = [parseInt($("#prem").val()), parseInt($("#cover").val()), parseInt($("#sun").val()), 
      $("#legal").val(), parseInt($("#wait").val()), $("#payhol").val(), $("#payback").val()];
    }

    if (custNum <= 0) {
      return false;
    }

    var claimObj = {
      "Data ID": "None",
      "Premium": data[0],
      "Cover amount": data[1],
      "Sundries benefit": data[2],
      "Legal advice": data[3],
      "Waiting period (days)": data[4],
      "Payment holiday": data[5],
      "Premium payback": data[6]
    };
    
    App.contracts.IdentityFactory.deployed().then(function(instance) {
      factoryInstance = instance;
      return factoryInstance.getContractAddress(2, App.account);
    }).then(function(conAddress) {
      corpInstance = App.contracts.IdentityInsurer.at(conAddress);
      return corpInstance.createFuneralPlan(plan, custNum, data[0], data[1], data[2], data[3], 
        data[4], data[5], data[6], {from: App.account});
    }).then(function() {
    }).then(function() {
      // Listen for event emitted when new claim is created.
      corpInstance.NewClaim().watch(function(error, result) {
        if (!error) {
          // Add data identifier to data object, convert data object to JSON and output it as text file.
          claimObj["Data ID"] = result.args._dataId;
          var claimJSON = JSON.stringify(claimObj);
          if (plan == 2) {
            App.outputData(claimJSON, "Claim_Family_Funeral_Plan.json", "text/plain");
            corpInstance.NewClaim().stopWatching();
          }
          if (plan ==1) {
            App.outputData(claimJSON, "Claim_Single_Funeral_Plan.json", "text/plain");
            corpInstance.NewClaim().stopWatching();
          }
        } else {
          console.log(error);
        }
      });
    }).catch(function(err) {
      console.log(err);
    });
  }

};
  
$(function() {
  $(window).load(function() {
    // Start the application.
    App.init();
  });

  var _account; // Current account.

  var accountInterval = setInterval(function() {
    // Update account.
    App.updateAccount();
    // If account has changed, login to system with updated account.
    if (_account != App.account) {
      _account = App.account;
      App.login();
    }
  }, 100);
});
   
