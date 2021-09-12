const ModelBuildUpHelper = (v) => {
    this._id = v._id;
    this.createdAt = v.createdAt || Date.now();
    // we take this as the date it was last updated
    this.updatedAt = v.updatedAt || Date.now(); 
    return this;
}

module.exports = ModelBuildUpHelper;
