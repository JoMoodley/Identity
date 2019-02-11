# Identity

This project is a demonstration of self-sovereign identity verification for funeral insurance. 

The use case consists of four entities: an insurance company, a customer, a relative of the customer and a government. The insurer has two departments, Youth Markets and Family Markets. Youth Markets offers a Single Funeral Plan for the customer. Family Markets offers a Family Funeral Plan for the customer and his dependent relative. [Self-sovereign identity](https://sovrin.org/wp-content/uploads/2018/03/The-Inevitable-Rise-of-Self-Sovereign-Identity.pdf) is the concept of a decentralized identity in which the customer controls his identity information and how it is shared. This can be done with claims created by the customer and verified by government that the customer has certain attributes. The customer can then share claims with the insurer to acquire their products and doesn’t need to share actual data. The government and insurer are reliable parties that can verify claims. Blockchains such as Ethereum can provide the technology to enable this type of identity system and decentralized applications can be built that connects the user to the network.

This use case is not based on any particular organization.

This project is licensed under the terms of the MIT license.

### Contents of the system
Ethereum Solidity smart contracts, HTML and Bootstrap interface, JavaScript application.

### Tools used
[Truffle](https://truffleframework.com/truffle) - A framework to develop, test and deploy smart contracts.  
[Ganache](https://truffleframework.com/ganache) – A local ethereum node and ledger. Provides accounts for testing that have ether, public addresses and private keys.  
[MetaMask](https://metamask.io/) – A browser-based wallet account to connect to the system from the application.  
[web3.js](https://web3js.readthedocs.io/en/1.0/index.html), [node.js](https://nodejs.org/en/) – JavaScript libraries.

Other sofware required includes Geth and npm (node package manager).  
The code was written using Visual Studio Code.

### Testing
Contract tests are provided. These can be executed in the terminal with `truffle test --network test`.

### Instructions to run the system and demonstrate the use case
Note that there can be issues with the browser not automatically refreshing the page when a change occurs. In this case, manually refresh the page.

##### Set up the application

*Step 1a*. Download the truffle project. If your operating system is Linux, rename `truffle-config.js` to `truffle.js`. Open the terminal and proceed to the relevant directory. Run `npm install` to install any package dependencies.

*Step 1b*. Open Ganache. Log in to MetaMask and select the local network. Add accounts 0 to 3 from Ganache to the wallet using the public and private keys in Ganache. If accounts are already added, ensure that there are no historical transactions by resetting the accounts.

*Step 1c*. Run `truffle migrate --reset` or similar. The contracts should compile and deploy from account 0 in Ganache. Then execute `npm run dev`. The application opens in the browser.

##### Create identities

*Step 2*. From account 0 in the wallet, select the option to create an identity for government and pay for the transaction. Similarly, from wallet accounts 1 to 3, create identities for the insurer, customer and his relative. 

##### Create and verify identity claims

*Step 3a.* Log in as customer and create claims for national identity, residential address and age.

*Step 3b.* Log in as relative and create claim for national identity.

*Step 3c.* Log in as government, view and verify all claims.

*Step 3d.* Log in as customer or relative and view verified claims.

##### Demonstrate the use case

###### Customer applies for Single Funeral Plan from Youth Markets

*Step 4a.* Log in as customer. Sign up to the insurer. Share all 3 claims.

*Step 4b.* Log in as insurer. View customer has been added. Select to view customer's shared claims. Issue claim on Single Funeral Plan to customer. Customer's shared claims are updated.

*Step 4c.* Log in as customer. View Single Funeral Plan claim.

###### Customer applies for Family Funeral Plan from Family Markets

*Step 5a.* Log in as customer. Add dependent (account 3).

*Step 5b.* Log in as relative. Sign up to the insurer. Share claim.

*Step 5c.* Log in as insurer. View that customer has added a dependent and relative has been added as a customer. Select to view relative's shared claims. Select to view customer's shared claims. Issue claim on Family Funeral Plan to customer. Customer's shared claims are updated.

*Step 5d.* Log in as customer. View Family Funeral Plan claim.

----------
