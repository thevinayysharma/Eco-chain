const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
	constructor(fromAddress, toAddress, amount) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingkey) {
        if(signingkey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallet');
        }

        const hashtx = this.calculateHash();
        const sig = signingkey.sign(hashtx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

//building the block
class Block {
    constructor(timestamp, transactions, previousHash = '' ) {
		this.timestamp = timestamp;
		this.transactions = transactions;
                this.previousHash = previousHash;
                this.hash = this.calculateHash();
		this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.date) + this.nonce).toString();
    }

	mineBlock(difficulty) {
		while(this.hash.substring(0,  difficulty) !== Array(difficulty + 1).join("0")) {
                      this.nonce++;
		      this.hash = this.calculateHash();
		}
		console.log("BLOCK MINED: " + this.hash);
	}

    hasValidTransactions() {
        for(const tx of this.transactions) {
            if(!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}


//building the chain
class Blockchain{
	constructor() {
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 2;

		//store transactions
		this.pendingTransactions = [];

		//reward for miner
		this.miningReward = 100;
	}

	createGenesisBlock() {
		return new Block("07/06/2021", [], "0");
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	minePendingTransactions(miningRewardAddress) {

		//new block with all pending transactions and mining it..
		let block = new Block(Date.now(), this.pendingTransactions);
                block.mineBlock(this.difficulty);

		console.log("Block succesfully mined");
		
		this.chain.push(block);

		//reset transactions
		this.pendingTransactions = [
			new Transaction(null, miningRewardAddress, this.miningReward)
		];
	}

	addTransaction(transaction) {

        if(!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        //Verify the transaction
        if(!transaction.isValid()) {
            throw new Error('Cannot add invalid transactions to the chain');
        }

        if(transaction.amount <= 0) {
            throw new Error('Transaction amount should be higher than 0')
        }

		this.pendingTransactions.push(transaction);
	}

	//Balances..txctn logic
	getBalanceOfAddress(address){
		let balance = 0;

		for(const block of this.chain) {
			for(const trans of block.transactions) {

				//sender --> receiver  [balance deduction]
				if(trans.fromAddress === address) {
					balance -= trans.amount;
				}

				//receiver <-- sender   [balance addition]
				if(trans.toAddress === address) {
					balance += trans.amount;
				}
			}
		}

		return balance;

	}

	isChainValid() {

        const realGenesis = JSON.stringify(this.createGenesisBlock());

        if (realGenesis !== JSON.stringify(this.chain[0])) {
         return false;
        }


		for (let i = 1; i < this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			// if (previousBlock.hash !== currentBlock.previousHash) { return false; }
          
            if (!currentBlock.hasValidTransactions()) {
                return false;
            }
        
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
		}

		return true;
	}
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;
