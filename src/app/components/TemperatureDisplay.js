import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase';
import { format } from 'date-fns';

export default function TemperatureDisplay() {
  const [temperature, setTemperature] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isConnected, setIsConnected] = useState(true); // To track board connection status

  useEffect(() => {
    const tempRef = ref(database, 'sensor/data');

    // Listening to temperature updates
    onValue(tempRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedData = Object.values(data).sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        const latestEntry = sortedData[0]; // Get the most recent entry

        setTemperature(latestEntry.temperature);
        setTimestamp(latestEntry.timestamp);
        setLastUpdate(Date.now()); // Update the lastUpdate time
        setIsConnected(true); // Reset connection status on new data
      }
    });

    // Check if there's no update within 5 seconds
    const checkConnection = setInterval(() => {
      if (Date.now() - lastUpdate > 5000) {
        setIsConnected(false); // Mark the board as disconnected
      }
    }, 1000); // Check every second

    return () => clearInterval(checkConnection); // Cleanup on component unmount
  }, [lastUpdate]);

  // Format date and time
  const formattedDate = timestamp ? format(new Date(timestamp), 'dd-MM-yyyy') : 'N/A';
  const formattedTime = timestamp ? format(new Date(timestamp), 'HH:mm:ss') : 'N/A';

  // Determine the text color based on temperature
  const tempColor = temperature < 20 ? 'text-blue-500' : temperature > 30 ? 'text-red-500' : 'text-sky-400';

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800">Current Temperature</h2>

      {/* Temperature Display */}
      <p className={`text-2xl font-bold ${tempColor}`}>
        {temperature !== null ? `${temperature}°C` : 'Loading...'}
      </p>

      {/* Timestamp Display */}
      <p className="text-sm text-gray-500">
        Last Updated Date: {formattedDate}
      </p>
      

      <p className="text-sm text-gray-500">
        Last Updated Time: {formattedTime}
      </p>
      <p className="text-sm text-gray-500">
        Location: CPI, The Coxon Building, John Walker Road, Sedgefield, United Kingdom, TS21 3FE.
      </p>
      {/* Updating Message */}
      <p className="text-sm text-sky-400 mt-1">
        Board is sending data in every 5 seconds...
      </p>

      {/* Connection Status */}
      {!isConnected && (
        <p className="text-sm text-red-500 mt-1">
          Board is disconnected!
        </p>
      )}
    </div>
  );
}
