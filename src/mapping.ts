import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/MetaMultiSigWallet/MetaMultiSigWallet";
import { TransferEvent, Account } from "../generated/schema";
import { TokenTemplate } from "../generated/templates";
import { Address } from "@graphprotocol/graph-ts";

export function handleTransfer(event: Transfer): void {
  let transferEvent = new TransferEvent(event.transaction.hash.toHex());
  transferEvent.from = event.params.from;
  transferEvent.to = event.params.to;
  transferEvent.value = event.params.value;
  transferEvent.blockNumber = event.block.number;
  transferEvent.blockTimestamp = event.block.timestamp;
  transferEvent.transactionHash = event.transaction.hash;
  transferEvent.transferType = "STANDARD"; 
  transferEvent.save();

  let fromAccount = getOrCreateAccount(event.params.from.toHex());
  fromAccount.balance = fromAccount.balance.minus(event.params.value);
  fromAccount.totalTransferred =  fromAccount.totalTransferred.plus(event.params.value);
  fromAccount.save();

  let toAccount = getOrCreateAccount(event.params.to.toHex());
  toAccount.balance = toAccount.balance.plus(event.params.value);
  toAccount.save();

  let toAddress = Address.fromString(event.params.to.toHex());
  TokenTemplate.create(toAddress);
  
}

function getOrCreateAccount(id: string): Account {
  let account = Account.load(id);
  if (account == null) {
    account = new Account(id);
    account.balance = BigInt.fromI32(0);
  }
  return account;
}
