import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase';


export default function StatusDisplay() {
  const [boardStatus, setBoardStatus] = useState('Disconnected');
  const [wifiStatus, setWifiStatus] = useState('Disconnected');
  const [sensorStatus, setSensorStatus] = useState('Disconnected');

  useEffect(() => {
    // Reference to the data path in Firebase
    const statusRef = ref(database, 'sensor/data');

    // Listen for real-time updates
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the data object to an array and sort by timestamp
        const sortedData = Object.values(data).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const latestEntry = sortedData[0];  // Get the most recent entry
        
        // Update the statuses based on the most recent data entry
        setBoardStatus(latestEntry.board_status || 'Disconnected');
        setWifiStatus(latestEntry.wifi_status || 'Disconnected');
        setSensorStatus(latestEntry.sensor_status || 'Disconnected');
      }
    });
  }, []);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800">Board Information</h2>
      <p>Board Status: <span className={`${boardStatus === 'Connected' ? 'text-green-500' : 'text-red-500'}`}>{boardStatus}</span></p>
      <p>Wi-Fi Status: <span className={`${wifiStatus === 'Connected' ? 'text-green-500' : 'text-red-500'}`}>{wifiStatus}</span></p>
      <p>Sensor Status: <span className={`${sensorStatus === 'Connected' ? 'text-green-500' : 'text-red-500'}`}>{sensorStatus}</span></p>
    </div>
  );
}
