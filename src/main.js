const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('caebd7b96ec48eec04ddc0cb707bf28d0310c75aad8807f66c363b47747959f0');
const myWalletAddress = myKey.getPublic('hex');

let ecoCoin = new Blockchain();

// Mine first block
ecoCoin.minePendingTransactions(myWalletAddress);

const tx1 = new Transaction(myWalletAddress, 'address2', 100);
tx1.signTransaction(myKey);
ecoCoin.addTransaction(tx1);

// Mine block
ecoCoin.minePendingTransactions(myWalletAddress);
console.log("\nBalance of Sharma's address is: ", ecoCoin.getBalanceOfAddress(myWalletAddress));

// // Create second transaction
const tx2 = new Transaction(myWalletAddress, 'address1', 50);
tx2.signTransaction(myKey);
ecoCoin.addTransaction(tx2);

// console.log("\nStarting the miner...");
ecoCoin.minePendingTransactions(myWalletAddress);

console.log("\nBalance of Sharma's address is: ", ecoCoin.getBalanceOfAddress(myWalletAddress));

// ecoCoin.chain[1].transactions[0].amount = 10;
console.log();
console.log('Is chain valid', ecoCoin.isChainValid());
