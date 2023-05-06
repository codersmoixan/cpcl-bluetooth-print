const { CPCL } = require('../bluetooth-v2/index');

/**
 * @description 顺丰快递单模版
 * @param {Object} config - 模版信息
 * @param {string} config.barcode - 条码信息
 * @param {string} config.expressNo - 顺丰单号
 * @param {string} config.time - 下单时间
 * @param {string} config.senderAddress - 发件人地址
 * @param {string} config.senderContact - 寄件人联系方式
 * @param {string} config.recipientAddress - 收件人地址
 * @param {string} config.recipientContact - 收件人联系方式
 * @param {string} config.thing - 发货物品
 * @param {string} config.qrCode - 二维码信息
 * @param {string | number} config.qty - 数量
 * @param {string} config.payment - 支付方式
 * @param {string} config.expressType - 快递类型
 * @param {string} config.orderNo - 订单号
 * */
function SF({
  barcode = 'SF6399695948',
  expressNo = 'SF6399695948',
  time = '2023-05-06 14:26:00',
  senderAddress = '这是一段很长的文本，需要自动换行，所以我们使用了TEXT指令的WIDTH参数来指定每行的最大宽度。',
  senderContact = '苏先生: 13398410573',
  recipientAddress = '北京市海淀区长春桥路',
  recipientContact = '刘先生: 15528476654',
  thing = '运动营养香橙黑加仑味耐力固体饮料',
  qrCode = 'https://www.baidu.com',
  qty = 1,
   payment = '微信支付',
  expressType = '标准快递',
  orderNo = '000004999'
} = {}) {
  const command = new CPCL()
  command.init()
    .addCommand(`! 5 200 200 990 1`)
    .addCommand(`PAGE - WIDTH 630`)
    .addCommand(`BOX 10 10 560 990 2`)
    .addCommand(`CENTER`)

    // 条纹码打印 非数字无法打印
    .addCommand(`BARCODE-TEXT OFF`) // 打印条码，不打印条码文本
    .addCommand(`BARCODE 128 2 0 60 0 30 ${barcode}`)
    .addCommand(`LEFT`)
    .addCommand(`T 6 0 20 100 ${expressNo}`)
    .addCommand(`RIGHT`)
    .addCommand(`T 6 0 20 100 ${time}`)
    .addCommand(`LEFT`)
    .addCommand(`LINE 10 130 560 130 2`)

    // 寄件方信息
    .addCommand(`T 6 0 20 145 寄件方信息： `)
    .batchAddCommand(senderAddress, 175)
    .addCommand(`T 6 0 20 295 ${senderContact}`)
    .addCommand(`LINE 10 330 560 330 2`)

    // 收件方信息
    .addCommand(`T 6 0 20 345 收件方信息： `)
    .batchAddCommand(recipientAddress, 375)
    .addCommand(`T 6 0 20 495 ${recipientContact}`)
    .addCommand(`LINE 10 530 560 530 2`)

    // 产品名称
    .batchAddCommand(thing, 545, 305)
    .addCommand(`LINE 10 640 310 640 2`)

    // 二维码
    .addCommand(`LEFT`)
    .addCommand(`B QR 335 560 M 2 U 8`)
    .addCommand(`MA,${qrCode}`)
    .addCommand(`ENDQR`)

    .addCommand(`LINE 310 530 310 940 2`)

    .addCommand(`T 6 0 20 655 `)
    .addCommand(`LINE 10 700 310 700 2`)

    .addCommand(`LINE 150 700 150 880 2`)

    // 件数
    .addCommand(`T 6 0 20 715 件数`)
    .addCommand(`T 6 0 165 715 ${qty}`)
    .addCommand(`LINE 10 760 310 760 2`)

    // 付款方式
    .addCommand(`T 6 0 20 775 付款方式`)
    .addCommand(`T 6 0 165 775 ${payment}`)
    .addCommand(`LINE 10 820 310 820 2`)

    // 快递类型
    .addCommand(`T 6 0 20 835 类型`)
    .addCommand(`T 6 0 165 835 ${expressType}`)
    .addCommand(`LINE 10 880 310 880 2`)

    // 订单号
    .addCommand(`T 6 0 20 895 订单号：`)
    .addCommand(`T 6 0 130 895 ${orderNo}`)
    .addCommand(`LINE 10 940 560 940 2`)

    .addCommand(`FORM`)
    .setPagePrint()

  return command
}

module.exports = {
  SF
}
