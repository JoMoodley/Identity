# Identity

This project is a demonstration of self-sovereign identity verification for funeral insurance. 

The use case consists of four entities: an insurance company, a customer, a relative of the customer and a government. The insurer has two departments, Youth Markets and Family Markets. Youth Markets offers a Single Funeral Plan for the customer. Family Markets offers a Family Funeral Plan for the customer and his dependent relative. Self-sovereign identity is the concept of a decentralized identity in which the customer controls his identity information and how it is shared. This can be done with claims created by the customer and verified by government that the customer has certain attributes. The customer can then share claims with the insurer to access their products and doesn’t need to share actual data. The government and insurer are reliable parties that can verify claims.

This use case is not based on any particular organization.

This project is licensed under the terms of the MIT license.

### Contents of the system
Ethereum smart contracts, HTML interface, JavaScript application.

### Tools
Truffle  - A framework to develop, test and deploy smart contracts.
Ganache – A local ethereum node and ledger. Provides accounts for testing that have public addresses and private keys.
MetaMask – A browser-based wallet account to connect to the system from the dapp.
web3.js, node.js – JavaScript libraries.
Other sofware required includes Geth and npm (node package manager).
The system was coded using Visual Studio Code.

### Instructions to run the system
Note that there can be issues with the browser not refreshing the page when a change occurs. In this case, manually refresh the page.

Step 1. Download the truffle project. If Linux is your operating system, rename truffle-config.js to truffle.js. Open the terminal and proceed to the relevant directory. Run npm install to install any package dependencies.

Step 2. Open Ganache. Log in to MetaMask and select the local network. Add accounts 0 to 3 from Ganache to the wallet using the public and private keys in Ganache. If accounts are already added, ensure that there are no historical transactions by reseting the accounts.

Step 3. Run truffle migrate --reset or similar. The contracts should compile and deploy from account[0] in Ganache. Then execute npm run dev. The application opens in the browser.

Step 4. From account 0 in the wallet, click option to create identity for Government. Similarly, from accounts 1 to 3, create identities for Insurer, Customer and Relative. 

Step 5. Log in as customer and create claims for national identity, residential address and age.

Step 6. Log in as relative and create claim for national identity.

Step 7. Log in as government and verify all claims.

The subsequent steps demo the use case.

Step 8. Log in as customer. Sign up to the insurer. Share claims.

