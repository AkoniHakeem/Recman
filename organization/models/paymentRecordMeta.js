const PaymentRecordMeta = function(p) {
    this._id = p._id
    this.recordName = p.recordName;
    this.organizationId = p.organizationId;
    this.userId = p.userId;
    this.target = p.target;
    this.cycle = p.cycle 
}

module.exports = PaymentRecordMeta;