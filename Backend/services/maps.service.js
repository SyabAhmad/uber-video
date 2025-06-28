const axios = require('axios');
const captainModel = require('../models/captain.model');

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log('Google API Response:', response.data); // Debug log
        
        if (response.data.status === 'OK') {
            return response.data.predictions.map(prediction => prediction.description).filter(value => value);
        } else if (response.data.status === 'REQUEST_DENIED') {
            console.error('Google API Error:', response.data.error_message);
            // Return fallback suggestions for development
            return [
                `${input} - Street 1`,
                `${input} - Street 2`,
                `${input} - Plaza`,
                `${input} - Market`
            ];
        } else {
            throw new Error(`Google API Error: ${response.data.status}`);
        }
    } catch (err) {
        console.error('Maps API Error:', err.response?.data || err.message);
        // Return fallback suggestions for development
        return [
            `${input} - Street 1`,
            `${input} - Street 2`,
            `${input} - Plaza`,
            `${input} - Market`
        ];
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log('Distance API Response:', response.data); // Debug log
        
        if (response.data.status === 'OK') {
            if (response.data.rows[0].elements[0].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }
            return response.data.rows[0].elements[0];
        } else if (response.data.status === 'REQUEST_DENIED') {
            console.error('Google API Error:', response.data.error_message);
            // Return fallback data for development
            return {
                distance: { text: "10 km", value: 10000 },
                duration: { text: "15 mins", value: 900 }
            };
        } else {
            throw new Error(`Google API Error: ${response.data.status}`);
        }
    } catch (err) {
        console.error('Distance API Error:', err.response?.data || err.message);
        // Return fallback data for development
        return {
            distance: { text: "10 km", value: 10000 },
            duration: { text: "15 mins", value: 900 }
        };
    }
}

module.exports.getAddressCoordinate = async (address) => {
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log('Geocoding API Response:', response.data); // Debug log
        
        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else if (response.data.status === 'REQUEST_DENIED') {
            console.error('Google API Error:', response.data.error_message);
            // Return fallback coordinates (Islamabad, Pakistan)
            return {
                ltd: 33.6844,
                lng: 73.0479
            };
        } else {
            throw new Error(`Google API Error: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Geocoding Error:', error.response?.data || error.message);
        // Return fallback coordinates (Islamabad, Pakistan)
        return {
            ltd: 33.6844,
            lng: 73.0479
        };
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    // radius in km
    console.log(`Searching for captains near ${ltd}, ${lng} within ${radius}km`); // Debug log
    
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [ [ lng, ltd ], radius / 6371 ] // Note: lng, ltd order for GeoJSON
            }
        },
        status: 'active' // Only get active captains
    });

    console.log(`Found ${captains.length} active captains in radius`); // Debug log
    return captains;
};

module.exports.getFare = async (pickup, destination, vehicleType) => {
    // Dummy fallback logic for fare calculation
    // Replace with your real logic or API call
    return 100 + Math.floor(Math.random() * 100);
};

module.exports = {
    getAutoCompleteSuggestions: module.exports.getAutoCompleteSuggestions,
    getDistanceTime: module.exports.getDistanceTime,
    getAddressCoordinate: module.exports.getAddressCoordinate,
    getCaptainsInTheRadius: module.exports.getCaptainsInTheRadius,
    getFare: module.exports.getFare
};