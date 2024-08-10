import { newMockEvent, test, assert } from "matchstick-as";
import { Transfer } from "../../generated/MetaMultiSigWallet/MetaMultiSigWallet";
import { handleTransfer } from "../mapping";
import { TransferEvent, Account } from "../../generated/schema";
import { ethereum ,Address, BigInt } from "@graphprotocol/graph-ts";

function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): Transfer {
  let event = newMockEvent() as Transfer;
  event.parameters = [
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from)),
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to)),
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value)),
  ];
  return event;
}

test("handleTransfer correctly updates account balances", () => {
  let from = Address.fromString("0x123...");
  let to = Address.fromString("0x456...");
  let value = BigInt.fromI32(100);

  let event = createTransferEvent(from, to, value);
  handleTransfer(event);

  let fromAccount = Account.load(from.toHex());
  let toAccount = Account.load(to.toHex());

  assert.fieldEquals("Account", fromAccount!.id, "balance", "900"); // Assuming initial balance was 1000
  assert.fieldEquals("Account", toAccount!.id, "balance", "1100"); // Assuming initial balance was 1000
});
