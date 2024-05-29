import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

const fetchurl = 'https://data.sfgov.org/resource/rqzj-sfat.json';
const geoFetchUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

function Foodtrucks() {
  const [foodTrucks, setFoodTrucks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nearbyTrucks, setNearbyTrucks] = useState([]);
  const [zipcode, setZipcode] = useState('');
  const [tacoTruck, setTacoTruck] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(fetchurl);
        const data = await response.json();
        setFoodTrucks(data.slice(0, 10)); 
        const tacoTrucks = getTacoTrucks(data);
        setTacoTruck(tacoTrucks);
      } catch (error) {
        console.error('Error fetching food truck :', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTacoTrucks = (trucks) => {
    return trucks
      .filter(truck => truck.fooditems && truck.fooditems.toLowerCase().includes('taco'))
      .map(truck => ({ name: truck.applicant, permit: truck.permit }));
  };

  const handleSelectionChange = (event) => {
    const permit = event.target.value;
    const truck = foodTrucks.find(truck => truck.permit === permit);
    
    if (truck && truck.applicant && truck.locationdescription && truck.fooditems) {
      setError(null); 
      setSelectedTruck(truck);
    } else {
      setError('Selected taco truck has empty details.');
      setSelectedTruck(null); 
    }
  };
    
  const getGeocode = async (zipcode) => {
    try {
      const response = await axios.get(geoFetchUrl, {
        params: {
          address: zipcode,
        },
      });
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    } catch (error) {
      console.error('Error fetching geocode data:', error);
      setError('Failed to get location coordinates.');
      return null;
    }
  };

  const handleFindNearby = async () => {
    setIsLoading(true);
    setError(null);
    setNearbyTrucks([]);
    try {
      const location = await getGeocode(zipcode);
      if (!location) return;
      
      const nearbytruck = foodTrucks.filter(truck => {
        if (!truck.latitude || !truck.longitude) 
        return false;
      });
      setNearbyTrucks(nearbytruck);
    } catch (error) {
      console.error('Error finding nearby trucks:', error);
      setError('Failed to find nearby food trucks.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container"> 
      <div className="container"> 
        <div className="food-trucks">
          <h1>Food Trucks</h1>
          <div className="taco-truck">
            {tacoTruck.length > 0 && (
              <div>
                <h2>Select a Taco Truck</h2>
                <select onChange={handleSelectionChange} defaultValue="">
                  <option value="" disabled>Select a taco truck</option>
                  {tacoTruck.map((truck, indexitem) => (
                    <option 
                    key={`${truck.permit}-${indexitem}`} 
                    value={truck.permit}>
                        {truck.name}
                    </option>
                  ))}
                </select>
                {selectedTruck && (
                  <div>
                    <h3>Selected Taco Truck Details</h3>
                    <p><b>Name</b> : {selectedTruck.applicant}</p>
                    <p><b>Location:</b> {selectedTruck.locationdescription}</p>
                    <p><b>Food Type:</b> {selectedTruck.fooditems}</p>
                  </div>
                )}
              </div>
            )}
          </div>  
          <div>

          <h2>Nearby Food Trucks</h2>
          <input 
            type="text" 
            value={zipcode} 
            onChange={(e) => setZipcode(e.target.value)} 
            placeholder="Enter ZIP code" 
          />
          <button onClick={handleFindNearby}>Find Nearby Food Trucks</button>
          {isLoading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          {nearbyTrucks.length > 0 && (
            <div className="nearby-food-trucks">
              <ul>
                {nearbyTrucks.map((truck, keyitem) => (
                  <li key={`${truck.permit}-${keyitem}`}>
                    <div className="food-card">
                      <h3>{truck.applicant}</h3>
                      <p>{truck.locationdescription}</p>
                      <p>{truck.fooditems}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
           <h1>Available Food Trucks in SF</h1>
          {foodTrucks.length > 0 && (
            <div className="food-truck-cards">
              {foodTrucks.map((truck, index) => (
                <div key={`${truck.permit}-${index}`} className="food-card">
                    <h3>{truck.applicant}</h3>
                    <p>{truck.locationdescription}</p>
                    <p>{truck.fooditems}</p>
                </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Foodtrucks;
