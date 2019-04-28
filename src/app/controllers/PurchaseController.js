const Purchase = require('../models/Purchase')
const Ad = require('../models/Ad')
const User = require('../models/User')
const PurchaseMail = require('../jobs/PurchaseMail')
const Queue = require('../services/Queue')

class PurchaseController {
  async index (req, res) {
    const purchases = await Purchase.paginate(
      {},
      {
        page: req.params.page || 1,
        limit: 20,
        // populate: ['ad', 'user'],
        sort: '-createdAt'
      }
    )

    return res.json(purchases)
  }

  async store (req, res) {
    const { ad, content } = req.body

    const purchaseAd = await Ad.findById(ad)
      .populate('author')
      .populate('purchasedBy')

    if (purchaseAd.purchasedBy) {
      return res.status(400).json({ error: 'This ad was already purchased' })
    }

    const purchase = await Purchase.create({ ...req.body, user: req.userId })
    const user = await User.findById(req.userId)

    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    return res.json(purchase)
  }

  async accept (req, res) {
    const purchase = await Purchase.findById(req.params.id).populate('ad')

    await Ad.findByIdAndUpdate(purchase.ad.id, { purchasedBy: purchase.id })

    return res.send()
  }

  async destroy (req, res) {
    await Purchase.findByIdAndDelete(req.params.id)

    return res.send()
  }
}

module.exports = new PurchaseController()
