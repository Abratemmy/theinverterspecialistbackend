const dashboardService = require("../../services/dashboardService");

exports.getDashboard = async (req, res) => {

    try {

        const dashboard =
            await dashboardService.getDashboard();

        return res.status(200).json({

            success: true,

            data: dashboard

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};