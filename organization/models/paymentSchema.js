const ModelBuildUpHelper = require("./modeBuildUplHelper");

/**
 * Payment schema holds the fields that are contained in a dynamically created payment record.
 * @param {any} fields object that contains the field data.
 */
const PaymentSchema = function(fields) {
    this._id = fields._id;
    this.userId = fields.userId; // user that made the payment
    this.amount = fields.amount;
    this.timePeriod = fields.timePeriod;
    this.date = fields.date || Date.now();
    this.mode = fields.mode
    this.organizationId = fields.organizationId;
    return {
        ...ModelBuildUpHelper(fields),
        ...this
    }
}

module.exports = PaymentSchema