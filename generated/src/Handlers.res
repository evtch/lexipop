  @genType
module LexipopToken = {
  module Transfer = Types.MakeRegister(Types.LexipopToken.Transfer)
  module Approval = Types.MakeRegister(Types.LexipopToken.Approval)
}

  @genType
module MoneyTree = {
  module Deposit = Types.MakeRegister(Types.MoneyTree.Deposit)
  module Withdraw = Types.MakeRegister(Types.MoneyTree.Withdraw)
}

@genType /** Register a Block Handler. It'll be called for every block by default. */
let onBlock: (
  Envio.onBlockOptions<Types.chain>,
  Envio.onBlockArgs<Types.handlerContext> => promise<unit>,
) => unit = (
  EventRegister.onBlock: (unknown, Internal.onBlockArgs => promise<unit>) => unit
)->Utils.magic
