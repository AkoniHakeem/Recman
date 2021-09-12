const ModelBuildUpHelper = require("./modeBuildUplHelper");

const Organization = function(o){
    this.name = o.name;
    this.userId = o.userId;
    return {
        ...ModelBuildUpHelper(o),
        ...this
    }
} 

module.exports = Organization