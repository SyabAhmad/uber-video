const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const blackListTokenModel = require('../models/blackListToken.model');
const rideModel = require('../models/ride.model'); // Add this import
const { validationResult } = require('express-validator');


module.exports.registerCaptain = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const isCaptainAlreadyExist = await captainModel.findOne({ email });

    if (isCaptainAlreadyExist) {
        return res.status(400).json({ message: 'Captain already exist' });
    }


    const hashedPassword = await captainModel.hashPassword(password);

    const captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });

    const token = captain.generateAuthToken();

    res.status(201).json({ token, captain });

}

module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const captain = await captainModel.findOne({ email }).select('+password');

    if (!captain) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await captain.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = captain.generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({ token, captain });
}

module.exports.getCaptainProfile = async (req, res, next) => {
    res.status(200).json({ captain: req.captain });
}

module.exports.logoutCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    await blackListTokenModel.create({ token });

    res.clearCookie('token');

    res.status(200).json({ message: 'Logout successfully' });
}

module.exports.getCaptainStats = async (req, res, next) => {
    try {
        const captainId = req.captain._id;
        
        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        // Calculate earnings from completed rides
        const completedRides = await rideModel.find({
            captain: captainId,
            status: 'completed'
        });
        
        const todayRides = await rideModel.find({
            captain: captainId,
            status: 'completed',
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });
        
        const totalEarnings = completedRides.reduce((sum, ride) => sum + ride.fare, 0);
        const todayEarnings = todayRides.reduce((sum, ride) => sum + ride.fare, 0);
        
        // Calculate hours online (you might want to track this separately)
        // For now, we'll use a simple calculation based on rides
        const hoursOnline = completedRides.length * 0.5; // Assume 30 minutes per ride average
        
        const stats = {
            totalEarnings,
            todayEarnings,
            totalRides: completedRides.length,
            todayRides: todayRides.length,
            hoursOnline,
            rating: 4.8 // You can implement a rating system later
        };
        
        res.status(200).json(stats);
        
    } catch (error) {
        console.error('Error fetching captain stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getNearbyVehicles = async (req, res, next) => {
    try {
        const { lat, lng } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }
        
        // For testing, let's include inactive captains too
        const availableCaptains = await captainModel.find({
            status: { $in: ['active', 'inactive'] }, // Include both for testing
            // Comment out the location filter for now to test basic functionality
            /*
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: 10000 // 10km in meters
                }
            }
            */
        });
        
        console.log('Found captains:', availableCaptains.length); // Debug log
        
        // Group by vehicle type
        const vehicleData = {
            car: {
                available: availableCaptains.filter(captain => captain.vehicle?.vehicleType === 'car'),
                count: availableCaptains.filter(captain => captain.vehicle?.vehicleType === 'car').length
            },
            moto: {
                available: availableCaptains.filter(captain => captain.vehicle?.vehicleType === 'motorcycle'),
                count: availableCaptains.filter(captain => captain.vehicle?.vehicleType === 'motorcycle').length
            },
            auto: {
                available: availableCaptains.filter(captain => captain.vehicle?.vehicleType === 'auto'),
                count: availableCaptains.filter(captain => captain.vehicle?.vehicleType === 'auto').length
            }
        };
        
        console.log('Vehicle data:', vehicleData); // Debug log
        
        // Calculate estimated arrival time for each vehicle type
        const vehicleEstimates = {};
        
        Object.keys(vehicleData).forEach(vehicleType => {
            const vehicles = vehicleData[vehicleType].available;
            if (vehicles.length > 0) {
                // For testing, use random time between 2-8 minutes
                const estimatedTime = Math.floor(Math.random() * 6) + 2;
                
                vehicleEstimates[vehicleType] = {
                    available: true,
                    count: vehicles.length,
                    estimatedTime: estimatedTime,
                    distance: (Math.random() * 5 + 1).toFixed(1) // Random distance 1-6 km
                };
            } else {
                vehicleEstimates[vehicleType] = {
                    available: false,
                    count: 0,
                    estimatedTime: null,
                    distance: null
                };
            }
        });
        
        console.log('Vehicle estimates:', vehicleEstimates); // Debug log
        res.status(200).json(vehicleEstimates);
        
    } catch (error) {
        console.error('Error fetching nearby vehicles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
}

module.exports.updateCaptainStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const captainId = req.captain._id;
        
        const captain = await captainModel.findByIdAndUpdate(
            captainId, 
            { status: status },
            { new: true }
        );
        
        res.status(200).json(captain);
    } catch (error) {
        console.error('Error updating captain status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.goOnline = async (req, res, next) => {
    try {
        const { lat, lng } = req.body;
        const captainId = req.captain._id;
        
        const captain = await captainModel.findByIdAndUpdate(
            captainId,
            {
                status: 'active',
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                }
            },
            { new: true }
        );
        
        res.status(200).json(captain);
    } catch (error) {
        console.error('Error updating captain status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.goOffline = async (req, res, next) => {
    try {
        const captainId = req.captain._id;
        
        const captain = await captainModel.findByIdAndUpdate(
            captainId,
            { status: 'inactive' },
            { new: true }
        );
        
        res.status(200).json(captain);
    } catch (error) {
        console.error('Error updating captain status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};