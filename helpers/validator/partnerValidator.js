const orderService = require("../../service/order")
const { response } = require("../wrapper")

const isValidOrderIds = () => {
  return async (req, res, next) => {
    const { orderIds } = req.body
    const { partnerId } = req.params
    const { tanggalAwal, tanggalAkhir } = req.query
    if (tanggalAwal != "" && isNaN(new Date(tanggalAwal).getTime())) {
      return response(res, false, {}, "Date not valid", 400)
    }
    if (tanggalAkhir != "" && isNaN(new Date(tanggalAkhir).getTime())) {
      return response(res, false, {}, "Date not valid", 400)
    }
    const order = await orderService.getPartnerNotPayOrderByOrderIds({
      orderIds,
      partnerId,
      tanggalAkhir,
      tanggalAwal,
    })
    if (order.length != orderIds.length)
      return response(res, false, {}, "Order request not valid", 400)
    req.order = order
    next()
  }
}

module.exports = {
  isValidOrderIds,
}
