import { Escrow } from "generated";

Escrow.Deposited.handler(async ({ event, context }) => {
  const user = event.params.account.toLowerCase();
  const amount = event.params.amount;

  const currentBalance = await context.Balance.get(user);
  const newBalance = currentBalance ? currentBalance.amount + amount : amount;

  context.Balance.set({
    id: user,
    amount: newBalance,
  });

  context.Deposit.set({
    id: `${event.transaction.hash}-${event.logIndex}`,
    user: user,
    amount: amount,
    timestamp: event.block.timestamp,
  });
});

Escrow.Reserved.handler(async ({ event, context }) => {
  const callId = event.params.callId;
  const consumer = event.params.consumer.toLowerCase();
  const provider = event.params.provider.toLowerCase();
  const amount = event.params.amount;

  const currentBalance = await context.Balance.get(consumer);
  if (currentBalance) {
    context.Balance.set({
      id: consumer,
      amount: currentBalance.amount - amount,
    });
  }

  context.Call.set({
    id: callId,
    consumer: consumer,
    provider: provider,
    amount: amount,
    status: "reserved",
    reservedAt: event.block.timestamp,
    reserveTx: event.transaction.hash,
  });
});

Escrow.Released.handler(async ({ event, context }) => {
  const callId = event.params.callId;
  const provider = event.params.provider.toLowerCase();
  const amount = event.params.amount;

  const call = await context.Call.get(callId);
  if (call) {
    context.Call.set({
      ...call,
      status: "released",
      finalizedAt: event.block.timestamp,
      finalTx: event.transaction.hash,
    });
  }

  const providerBalance = await context.Balance.get(provider);
  context.Balance.set({
    id: provider,
    amount: providerBalance ? providerBalance.amount + amount : amount,
  });
});

Escrow.Refunded.handler(async ({ event, context }) => {
  const callId = event.params.callId;
  const consumer = event.params.consumer.toLowerCase();
  const amount = event.params.amount;

  const call = await context.Call.get(callId);
  if (call) {
    context.Call.set({
      ...call,
      status: "refunded",
      finalizedAt: event.block.timestamp,
      finalTx: event.transaction.hash,
    });
  }

  const consumerBalance = await context.Balance.get(consumer);
  context.Balance.set({
    id: consumer,
    amount: consumerBalance ? consumerBalance.amount + amount : amount,
  });
});

Escrow.Withdrawn.handler(async ({ event, context }) => {
  const user = event.params.account.toLowerCase();
  const amount = event.params.amount;

  const currentBalance = await context.Balance.get(user);
  if (currentBalance) {
    context.Balance.set({
      id: user,
      amount: currentBalance.amount - amount,
    });
  }

  context.Withdrawal.set({
    id: `${event.transaction.hash}-${event.logIndex}`,
    user: user,
    amount: amount,
    timestamp: event.block.timestamp,
  });
});

Escrow.RefundedForcibly.handler(async ({ event, context }) => {
  const callId = event.params.callId;
  const consumer = event.params.consumer.toLowerCase();
  const amount = event.params.amount;

  const call = await context.Call.get(callId);
  if (call) {
    context.Call.set({
      ...call,
      status: "force_refunded",
      finalizedAt: event.block.timestamp,
      finalTx: event.transaction.hash,
    });
  }

  const consumerBalance = await context.Balance.get(consumer);
  context.Balance.set({
    id: consumer,
    amount: consumerBalance ? consumerBalance.amount + amount : amount,
  });
});
