const errorsMessages = require("./errorsMessages")

const orgControllerErrors = {
    [errorsMessages.invalidArgs](res, error) {
        res.status(400).json({message: error});
    }
}

module.exports = {
    orgControllerErrors
}