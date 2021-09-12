const ModelBuildUpHelper = require("./modeBuildUplHelper");

const ExpectedPayment = function(e) {
    this.memberId = e.memberId;
    this.organizationId = e.organizationId;
    this.amount = e.amount;
    this.timePeriod = e.timePeriod;
    this.cycleYear = e.cycleYear;
    this.settled = e.settled;
    this.dateSettled = e.dateSettled;
    return {
        ...ModelBuildUpHelper(e),
        ...this
    }
}

module.exports = ExpectedPayment;