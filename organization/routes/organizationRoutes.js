const organizationController = require("../controllers/organizationController");

const _orgnizationRouter = (e) => {
    const orgRouter = e.Router();
    orgRouter.post("/create",  organizationController.create)

    orgRouter.get("", organizationController.getOrganizations)
    // todo: implement authorization for this route
    orgRouter.post("/add-member", organizationController.addMember)
     // todo: implement authorization for this route
    orgRouter.get("/get-members", organizationController.getMembers)
     // todo: implement authorization for this route
    orgRouter.post("/create-payment", organizationController.createPayment)

    orgRouter.post("/post-payment", organizationController.postPaymentRecord)

    orgRouter.get('/get-payments', organizationController.getPayments)

    orgRouter.get("/get-payment-records", organizationController.getPaymentRecords)

    orgRouter.get("/get-user", organizationController.getUser);

    orgRouter.get("/get-expected-payments/:paymentRecordName/:organizationId", organizationController.getExpectedPayments);

    orgRouter.post("/generate-expected-payments", organizationController.generateExpectedPayments);

    return orgRouter;
}

module.exports = _orgnizationRouter