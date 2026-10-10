  @genType
module Escrow = {
  module Deposited = Types.MakeRegister(Types.Escrow.Deposited)
  module Reserved = Types.MakeRegister(Types.Escrow.Reserved)
  module Released = Types.MakeRegister(Types.Escrow.Released)
  module Refunded = Types.MakeRegister(Types.Escrow.Refunded)
  module RefundedForcibly = Types.MakeRegister(Types.Escrow.RefundedForcibly)
  module Withdrawn = Types.MakeRegister(Types.Escrow.Withdrawn)
  module OperatorUpdated = Types.MakeRegister(Types.Escrow.OperatorUpdated)
}

@genType /** Register a Block Handler. It'll be called for every block by default. */
let onBlock: (
  Envio.onBlockOptions<Types.chain>,
  Envio.onBlockArgs<Types.handlerContext> => promise<unit>,
) => unit = (
  EventRegister.onBlock: (unknown, Internal.onBlockArgs => promise<unit>) => unit
)->Utils.magic
