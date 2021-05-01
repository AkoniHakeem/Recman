const organizationController = require("../controllers/organizationController");

const _orgnizationRouter = (e) => {
    const orgRouter = e.Router();
    orgRouter.post("/create",  organizationController.create)

    // todo: implement authorization for this route
    orgRouter.post("/add-member", organizationController.addMember)
     // todo: implement authorization for this route
    orgRouter.get("/get-members", organizationController.getMembers)
     // todo: implement authorization for this route
    orgRouter.post("/create-payment", organizationController.createPayment)

    orgRouter.post("/post-payment", organizationController.postPaymentRecord)

    return orgRouter;
}

module.exports = _orgnizationRouter