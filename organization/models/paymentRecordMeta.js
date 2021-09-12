const ModelBuildUpHelper = require("./modeBuildUplHelper");

const PaymentRecordMeta = function(p) {
    this.recordName = p.recordName;
    this.organizationId = p.organizationId;
    this.userId = p.userId;
    this.target = p.target; // target Amount
    this.cycle = p.cycle;
    this.currentCycle = p.currentCycle;
    this.skipCycle = p.skipCycle;
    this.lastCycleUpdatedAt = p.lastCycleUpdatedAt;
    this.suspended = p.suspended;
    this.currentYear = p.currentYear;
    return {
        ...this,
        ...ModelBuildUpHelper(p)
    } 
}

module.exports = PaymentRecordMeta;