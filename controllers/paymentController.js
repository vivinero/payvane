const paymentSchema = require("../Model/paymentModel");
const userSchema = require("../Model/userModel");

// Create a new payment
exports.createPayment = async (req, res) => {
    try {
        const {userId, amount, currency} = req.body;
        // Check if user exists
        const user = await userSchema.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            }); 
        }
       const newPayment = new paymentSchema({
        userId,
        amount, 
        currency
        });
         await newPayment.save();
         res.status(201).json({
            message: "Payment created successfully",
            payment: newPayment
         })
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        })
    }
}

// Get payment by ID
exports.getPaymentById = async(req, res) => {
    try {
        const {paymentId} = req.params
        if(!paymentId){
            return res.status(400).json({
                message: "Payment ID is required",
            })
        }
        const payment = await paymentSchema.findById(paymentId).populate("userId", "fullName email");
        if(!payment){
            return res.status(404).json({
                message: "Payment not found"
            })
        }
        res.status(200).json({
            message: "Payment retrieved successfully",
            payment
        })
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        })
    }
}

// Update payment status (for testing not for production)
exports.updatePaymentStatus = async (req, res) =>{
    try {
        const {paymentId} =req.params
        if(!paymentId){
            return res.status(400).json({
                message: "Payment ID is required",
            })
        }

        const status = req.body;
        const allowedStatuses = ["pending", "completed", "failed"]
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value",
            })
        }
        const updatePayment = await paymentSchema.findByIdAndUpdate(paymentId, {status}, {new: true})
        if(!updatePayment){
            return res.status(404).json({
                message: "Payment not found"
            })
        }
        res.status(200).json({
            message: "Payment status updated successfully",
            payment: updatePayment
        })  
    } catch (error) {
         res.status(500).json({
            message: "Server Error",
            error: error.message,
        })
    }
}