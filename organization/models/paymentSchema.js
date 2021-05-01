/**
 * Payment schema holds the fields that are contained in a dynamically created payment record.
 * @param {any} fields object that contains the field data.
 */
const PaymentSchema = function(fields) {
    this._id = field._id;
    this.userId = fields.userId; // user that made the payment
    this.amount = fields.amount;
    this.date = fields.date || Date.now();
    this.mode = fields.mode
    this.organizationId = fields.organizationId;
}

module.exports = PaymentSchema