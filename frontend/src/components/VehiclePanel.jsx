import React, { useState, useEffect } from 'react'
import axios from 'axios'

const VehiclePanel = (props) => {
    const [vehicleData, setVehicleData] = useState({
        car: { available: false, estimatedTime: null, count: 0 },
        moto: { available: false, estimatedTime: null, count: 0 },
        auto: { available: false, estimatedTime: null, count: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNearbyVehicles = async () => {
            try {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    console.log('Fetching vehicles for location:', latitude, longitude); // Debug log
                    
                    const response = await axios.get(
                        `${import.meta.env.VITE_BASE_URL}/users/nearby-vehicles?lat=${latitude}&lng=${longitude}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                    
                    console.log('Vehicle response:', response.data); // Debug log
                    setVehicleData(response.data);
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error fetching nearby vehicles:', error);
                console.error('Error response:', error.response?.data); // Debug log
                setLoading(false);
            }
        };

        fetchNearbyVehicles();
    }, []);

    if (loading) {
        return <div>Loading vehicles...</div>;
    }

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setVehiclePanel(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Choose a Vehicle</h3>
            
            {/* Car Option */}
            <div onClick={() => {
                if (vehicleData.car.available) {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('car')
                }
            }} className={`flex border-2 ${vehicleData.car.available ? 'active:border-black' : 'opacity-50 cursor-not-allowed'} mb-2 rounded-xl w-full p-3 items-center justify-between`}>
                <img className='h-10' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>UberGo <span><i className="ri-user-3-fill"></i>4</span></h4>
                    <h5 className='font-medium text-sm'>
                        {vehicleData.car.available 
                            ? `${vehicleData.car.estimatedTime} mins away` 
                            : 'No cars available'
                        }
                    </h5>
                    <p className='font-normal text-xs text-gray-600'>
                        Affordable, compact rides {vehicleData.car.count > 0 && `(${vehicleData.car.count} available)`}
                    </p>
                </div>
                <h2 className='text-lg font-semibold'>₹{props.fare.car}</h2>
            </div>

            {/* Moto Option */}
            <div onClick={() => {
                if (vehicleData.moto.available) {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('moto')
                }
            }} className={`flex border-2 ${vehicleData.moto.available ? 'active:border-black' : 'opacity-50 cursor-not-allowed'} mb-2 rounded-xl w-full p-3 items-center justify-between`}>
                <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png" alt="" />
                <div className='-ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>Moto <span><i className="ri-user-3-fill"></i>1</span></h4>
                    <h5 className='font-medium text-sm'>
                        {vehicleData.moto.available 
                            ? `${vehicleData.moto.estimatedTime} mins away` 
                            : 'No motos available'
                        }
                    </h5>
                    <p className='font-normal text-xs text-gray-600'>
                        Affordable motorcycle rides {vehicleData.moto.count > 0 && `(${vehicleData.moto.count} available)`}
                    </p>
                </div>
                <h2 className='text-lg font-semibold'>₹{props.fare.moto}</h2>
            </div>

            {/* Auto Option */}
            <div onClick={() => {
                if (vehicleData.auto.available) {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('auto')
                }
            }} className={`flex border-2 ${vehicleData.auto.available ? 'active:border-black' : 'opacity-50 cursor-not-allowed'} mb-2 rounded-xl w-full p-3 items-center justify-between`}>
                <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png" alt="" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>UberAuto <span><i className="ri-user-3-fill"></i>3</span></h4>
                    <h5 className='font-medium text-sm'>
                        {vehicleData.auto.available 
                            ? `${vehicleData.auto.estimatedTime} mins away` 
                            : 'No autos available'
                        }
                    </h5>
                    <p className='font-normal text-xs text-gray-600'>
                        Affordable Auto rides {vehicleData.auto.count > 0 && `(${vehicleData.auto.count} available)`}
                    </p>
                </div>
                <h2 className='text-lg font-semibold'>₹{props.fare.auto}</h2>
            </div>
        </div>
    )
}

export default VehiclePanel