import React from 'react'

const WaitingForDriver = ({ ride }) => {
    console.log('Ride data in WaitingForDriver:', ride); // Debug log

    return (
        <div className="p-6">
            <h3 className="text-2xl font-semibold mb-4">Waiting for Driver</h3>
            
            {/* Show OTP to user */}
            {ride?.otp && (
                <div className="bg-yellow-100 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-lg">Your OTP:</h4>
                    <p className="text-3xl font-bold text-center">{ride.otp}</p>
                    <p className="text-sm text-gray-600 mt-2">
                        Share this OTP with your driver to start the ride
                    </p>
                </div>
            )}
            
            <div className="text-center">
                <p>Driver is on the way...</p>
                {ride?.captain && (
                    <div className="mt-4">
                        <p className="font-semibold">{ride.captain.fullname.firstname}</p>
                        <p className="text-sm text-gray-600">{ride.captain.vehicle.plate}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaitingForDriver