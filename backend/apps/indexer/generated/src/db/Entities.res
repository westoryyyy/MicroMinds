open Table
open Enums.EntityType
type id = string

type internalEntity = Internal.entity
module type Entity = {
  type t
  let index: int
  let name: string
  let schema: S.t<t>
  let rowsSchema: S.t<array<t>>
  let table: Table.table
  let entityHistory: EntityHistory.t<t>
}
external entityModToInternal: module(Entity with type t = 'a) => Internal.entityConfig = "%identity"
external entityModsToInternal: array<module(Entity)> => array<Internal.entityConfig> = "%identity"
external entitiesToInternal: array<'a> => array<Internal.entity> = "%identity"

@get
external getEntityId: internalEntity => string = "id"

// Use InMemoryTable.Entity.getEntityIdUnsafe instead of duplicating the logic
let getEntityIdUnsafe = InMemoryTable.Entity.getEntityIdUnsafe

//shorthand for punning
let isPrimaryKey = true
let isNullable = true
let isArray = true
let isIndex = true

@genType
type whereOperations<'entity, 'fieldType> = {
  eq: 'fieldType => promise<array<'entity>>,
  gt: 'fieldType => promise<array<'entity>>,
  lt: 'fieldType => promise<array<'entity>>
}

module Balance = {
  let name = (Balance :> string)
  let index = 0
  @genType
  type t = {
    amount: bigint,
    id: id,
  }

  let schema = S.object((s): t => {
    amount: s.field("amount", BigInt.schema),
    id: s.field("id", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "amount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module Call = {
  let name = (Call :> string)
  let index = 1
  @genType
  type t = {
    amount: bigint,
    consumer: string,
    finalTx: option<string>,
    finalizedAt: option<int>,
    id: id,
    provider: string,
    reserveTx: string,
    reservedAt: int,
    status: string,
  }

  let schema = S.object((s): t => {
    amount: s.field("amount", BigInt.schema),
    consumer: s.field("consumer", S.string),
    finalTx: s.field("finalTx", S.null(S.string)),
    finalizedAt: s.field("finalizedAt", S.null(S.int)),
    id: s.field("id", S.string),
    provider: s.field("provider", S.string),
    reserveTx: s.field("reserveTx", S.string),
    reservedAt: s.field("reservedAt", S.int),
    status: s.field("status", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "amount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "consumer", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "finalTx", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "finalizedAt", 
      Integer,
      ~fieldSchema=S.null(S.int),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "provider", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "reserveTx", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "reservedAt", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "status", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module Deposit = {
  let name = (Deposit :> string)
  let index = 2
  @genType
  type t = {
    amount: bigint,
    id: id,
    timestamp: int,
    user: string,
  }

  let schema = S.object((s): t => {
    amount: s.field("amount", BigInt.schema),
    id: s.field("id", S.string),
    timestamp: s.field("timestamp", S.int),
    user: s.field("user", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "amount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "user", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module OperatorChange = {
  let name = (OperatorChange :> string)
  let index = 3
  @genType
  type t = {
    id: id,
    newOperator: string,
    oldOperator: string,
    timestamp: int,
    txHash: string,
  }

  let schema = S.object((s): t => {
    id: s.field("id", S.string),
    newOperator: s.field("newOperator", S.string),
    oldOperator: s.field("oldOperator", S.string),
    timestamp: s.field("timestamp", S.int),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "newOperator", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "oldOperator", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module Withdrawal = {
  let name = (Withdrawal :> string)
  let index = 4
  @genType
  type t = {
    amount: bigint,
    id: id,
    timestamp: int,
    user: string,
  }

  let schema = S.object((s): t => {
    amount: s.field("amount", BigInt.schema),
    id: s.field("id", S.string),
    timestamp: s.field("timestamp", S.int),
    user: s.field("user", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "amount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "user", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

let userEntities = [
  module(Balance),
  module(Call),
  module(Deposit),
  module(OperatorChange),
  module(Withdrawal),
]->entityModsToInternal

let allEntities =
  userEntities->Js.Array2.concat(
    [module(InternalTable.DynamicContractRegistry)]->entityModsToInternal,
  )

let byName =
  allEntities
  ->Js.Array2.map(entityConfig => {
    (entityConfig.name, entityConfig)
  })
  ->Js.Dict.fromArray
