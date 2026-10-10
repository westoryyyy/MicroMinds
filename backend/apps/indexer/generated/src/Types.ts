// This file is to dynamically generate TS types
// which we can't get using GenType
// Use @genType.import to link the types back to ReScript code

import type { Logger, EffectCaller } from "envio";
import type * as Entities from "./db/Entities.gen.ts";

export type LoaderContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  /**
   * True when the handlers run in preload mode - in parallel for the whole batch.
   * Handlers run twice per batch of events, and the first time is the "preload" run
   * During preload entities aren't set, logs are ignored and exceptions are silently swallowed.
   * Preload mode is the best time to populate data to in-memory cache.
   * After preload the handler will run for the second time in sequential order of events.
   */
  readonly isPreload: boolean;
  /**
   * Per-chain state information accessible in event handlers and block handlers.
   * Each chain ID maps to an object containing chain-specific state:
   * - isReady: true when the chain has completed initial sync and is processing live events,
   *            false during historical synchronization
   */
  readonly chains: {
    [chainId: string]: {
      readonly isReady: boolean;
    };
  };
  readonly Balance: {
    /**
     * Load the entity Balance from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Balance_t | undefined>,
    /**
     * Load the entity Balance from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Balance_t>,
    readonly getWhere: Entities.Balance_indexedFieldOperations,
    /**
     * Returns the entity Balance from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Balance_t) => Promise<Entities.Balance_t>,
    /**
     * Set the entity Balance in the storage.
     */
    readonly set: (entity: Entities.Balance_t) => void,
    /**
     * Delete the entity Balance from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Call: {
    /**
     * Load the entity Call from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Call_t | undefined>,
    /**
     * Load the entity Call from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Call_t>,
    readonly getWhere: Entities.Call_indexedFieldOperations,
    /**
     * Returns the entity Call from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Call_t) => Promise<Entities.Call_t>,
    /**
     * Set the entity Call in the storage.
     */
    readonly set: (entity: Entities.Call_t) => void,
    /**
     * Delete the entity Call from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Deposit: {
    /**
     * Load the entity Deposit from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Deposit_t | undefined>,
    /**
     * Load the entity Deposit from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Deposit_t>,
    readonly getWhere: Entities.Deposit_indexedFieldOperations,
    /**
     * Returns the entity Deposit from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Deposit_t) => Promise<Entities.Deposit_t>,
    /**
     * Set the entity Deposit in the storage.
     */
    readonly set: (entity: Entities.Deposit_t) => void,
    /**
     * Delete the entity Deposit from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly OperatorChange: {
    /**
     * Load the entity OperatorChange from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.OperatorChange_t | undefined>,
    /**
     * Load the entity OperatorChange from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.OperatorChange_t>,
    readonly getWhere: Entities.OperatorChange_indexedFieldOperations,
    /**
     * Returns the entity OperatorChange from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.OperatorChange_t) => Promise<Entities.OperatorChange_t>,
    /**
     * Set the entity OperatorChange in the storage.
     */
    readonly set: (entity: Entities.OperatorChange_t) => void,
    /**
     * Delete the entity OperatorChange from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Withdrawal: {
    /**
     * Load the entity Withdrawal from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Withdrawal_t | undefined>,
    /**
     * Load the entity Withdrawal from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Withdrawal_t>,
    readonly getWhere: Entities.Withdrawal_indexedFieldOperations,
    /**
     * Returns the entity Withdrawal from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Withdrawal_t) => Promise<Entities.Withdrawal_t>,
    /**
     * Set the entity Withdrawal in the storage.
     */
    readonly set: (entity: Entities.Withdrawal_t) => void,
    /**
     * Delete the entity Withdrawal from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};

export type HandlerContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  /**
   * Per-chain state information accessible in event handlers and block handlers.
   * Each chain ID maps to an object containing chain-specific state:
   * - isReady: true when the chain has completed initial sync and is processing live events,
   *            false during historical synchronization
   */
  readonly chains: {
    [chainId: string]: {
      readonly isReady: boolean;
    };
  };
  readonly Balance: {
    /**
     * Load the entity Balance from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Balance_t | undefined>,
    /**
     * Load the entity Balance from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Balance_t>,
    /**
     * Returns the entity Balance from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Balance_t) => Promise<Entities.Balance_t>,
    /**
     * Set the entity Balance in the storage.
     */
    readonly set: (entity: Entities.Balance_t) => void,
    /**
     * Delete the entity Balance from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Call: {
    /**
     * Load the entity Call from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Call_t | undefined>,
    /**
     * Load the entity Call from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Call_t>,
    /**
     * Returns the entity Call from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Call_t) => Promise<Entities.Call_t>,
    /**
     * Set the entity Call in the storage.
     */
    readonly set: (entity: Entities.Call_t) => void,
    /**
     * Delete the entity Call from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Deposit: {
    /**
     * Load the entity Deposit from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Deposit_t | undefined>,
    /**
     * Load the entity Deposit from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Deposit_t>,
    /**
     * Returns the entity Deposit from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Deposit_t) => Promise<Entities.Deposit_t>,
    /**
     * Set the entity Deposit in the storage.
     */
    readonly set: (entity: Entities.Deposit_t) => void,
    /**
     * Delete the entity Deposit from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly OperatorChange: {
    /**
     * Load the entity OperatorChange from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.OperatorChange_t | undefined>,
    /**
     * Load the entity OperatorChange from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.OperatorChange_t>,
    /**
     * Returns the entity OperatorChange from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.OperatorChange_t) => Promise<Entities.OperatorChange_t>,
    /**
     * Set the entity OperatorChange in the storage.
     */
    readonly set: (entity: Entities.OperatorChange_t) => void,
    /**
     * Delete the entity OperatorChange from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Withdrawal: {
    /**
     * Load the entity Withdrawal from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Withdrawal_t | undefined>,
    /**
     * Load the entity Withdrawal from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Withdrawal_t>,
    /**
     * Returns the entity Withdrawal from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Withdrawal_t) => Promise<Entities.Withdrawal_t>,
    /**
     * Set the entity Withdrawal in the storage.
     */
    readonly set: (entity: Entities.Withdrawal_t) => void,
    /**
     * Delete the entity Withdrawal from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};
