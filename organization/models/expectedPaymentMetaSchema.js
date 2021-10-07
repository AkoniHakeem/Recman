const ModelBuildUpHelper = require("./modeBuildUplHelper");

const ExpectedPaymentMetaSchema = function(e) {
    this.memberId = e.memberId;
    this.organizationId = e.organizationId;
    this.amountOwing = e.amountOwing;
    this.amountLastPaid = e.amountLastPaid;
    this.dateOfLastPayment = e.dateOfLastPayment;
    this.suspended = e.suspended;
    this.dateSuspended  = e.dateSuspended;
    this.amountExpected = e.amountExpected;
    return {
        ...ModelBuildUpHelper(e),
        ...this
    }
}

module.exports = ExpectedPaymentMetaSchema;