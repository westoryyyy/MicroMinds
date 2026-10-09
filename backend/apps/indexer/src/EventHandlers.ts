import { Escrow } from "generated";

Escrow.Deposited.handler(async ({ event, context }) => {
  const user = event.params.user.toLowerCase();
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
  const amount = event.params.amount;

  const currentBalance = await context.Balance.get(consumer);
  if (currentBalance) {
    context.Balance.set({
      id: consumer,
      amount: currentBalance.amount - amount,
    });
  }

  context.CallReservation.set({
    id: callId,
    consumer: consumer,
    amount: amount,
    status: "reserved",
    timestamp: event.block.timestamp,
  });
});

Escrow.Released.handler(async ({ event, context }) => {
  const callId = event.params.callId;
  const provider = event.params.provider.toLowerCase();
  const amount = event.params.amount;

  const reservation = await context.CallReservation.get(callId);
  if (reservation) {
    context.CallReservation.set({
      ...reservation,
      status: "released",
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

  const reservation = await context.CallReservation.get(callId);
  if (reservation) {
    context.CallReservation.set({
      ...reservation,
      status: "refunded",
    });
  }

  const consumerBalance = await context.Balance.get(consumer);
  context.Balance.set({
    id: consumer,
    amount: consumerBalance ? consumerBalance.amount + amount : amount,
  });
});

Escrow.Withdrawn.handler(async ({ event, context }) => {
  const user = event.params.user.toLowerCase();
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
