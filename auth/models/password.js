const Password = function(p) {
    this._id = p._id;
    this.userId = p.userId;
    this.hash = p.hash;
    this.createdAt = p.createdAt || Date.now();
    this.updatedAt = p.updatedAt || Date.now();
    this.createdBy = p.createdBy;
    this.updatedBy = p.updatedBy ;
}

module.exports = Password;