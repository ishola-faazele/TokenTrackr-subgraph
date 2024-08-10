import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/MetaMultiSigWallet/MetaMultiSigWallet";
import { TransferEvent, Account } from "../generated/schema";
// import { TokenTemplate } from "../generated/templates";
import { Address } from "@graphprotocol/graph-ts";

export function handleTransfer(event: Transfer): void {
  let transferEvent = new TransferEvent(event.transaction.hash.toHex());

  // Assert that required fields are not null
  assert(event.params.from !== null, "Error: 'from' address is null");
  assert(event.params.to !== null, "Error: 'to' address is null");
  assert(event.params.value !== null, "Error: 'value' is null");
  assert(event.transaction.hash !== null, "Error: 'transactionHash' is null");
  assert(event.block.number !== null, "Error: 'blockNumber' is null");
  assert(event.block.timestamp !== null, "Error: 'blockTimestamp' is null");

  transferEvent.from = event.params.from;
  transferEvent.to = event.params.to;
  transferEvent.value = event.params.value;
  transferEvent.blockNumber = event.block.number;
  transferEvent.blockTimestamp = event.block.timestamp;
  transferEvent.transactionHash = event.transaction.hash;
  transferEvent.transferType = "STANDARD"; 
  if (transferEvent.from && transferEvent.to && transferEvent.value) {
    transferEvent.save();
  } 

  let fromAccount = getOrCreateAccount(event.params.from.toHex());
  fromAccount.balance = fromAccount.balance.minus(event.params.value);
  fromAccount.totalTransferred =  fromAccount.totalTransferred.plus(event.params.value);
  fromAccount.save();

  let toAccount = getOrCreateAccount(event.params.to.toHex());
  toAccount.balance = toAccount.balance.plus(event.params.value);
  toAccount.save();

  let toAddress = Address.fromString(event.params.to.toHex());
  // TokenTemplate.create(toAddress);
  
}

function getOrCreateAccount(id: string): Account {
  let account = Account.load(id);
  
  if (account == null) {
    // Creating a new account if it doesn't exist
    account = new Account(id);
    account.balance = BigInt.fromI32(0);
    account.totalTransferred = BigInt.fromI32(0);
    account.blockNumber = BigInt.fromI32(0);
    account.blockTimestamp = BigInt.fromI32(0);
    account.save();  // Save the new account to ensure it's available for further operations
  }
  
  // Ensure that the account has been properly created and saved
  assert(account !== null, "Error: 'account' could not be loaded or created after initialization");

  return account;
}


