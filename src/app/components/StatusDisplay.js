import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase';

export default function StatusDisplay() {
  const [boardStatus, setBoardStatus] = useState('Disconnected');
  const [wifiStatus, setWifiStatus] = useState('Disconnected');
  const [sensorStatus, setSensorStatus] = useState('Disconnected');
  const [lastUpdate, setLastUpdate] = useState(Date.now()); // Track last update time

  useEffect(() => {
    let timeoutId; // Store the timeout ID

    // Reference to the data path in Firebase
    const statusRef = ref(database, 'sensor/data');

    // Listen for real-time updates from Firebase
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the data object to an array and sort by timestamp
        const sortedData = Object.values(data).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const latestEntry = sortedData[0];  // Get the most recent entry

        // Update the statuses based on the most recent data entry
        setBoardStatus(latestEntry.board_status || 'Disconnected');
        setWifiStatus(latestEntry.wifi_status || 'Disconnected');
        setSensorStatus(latestEntry.sensor_status || 'Disconnected');

        setLastUpdate(Date.now()); // Update the time of the last data received

        // Clear any existing timeout to reset the disconnection check
        clearTimeout(timeoutId);

        // Set a new timeout to mark as disconnected if no updates are received within 5 seconds
        timeoutId = setTimeout(() => {
          setBoardStatus('Disconnected');
          setWifiStatus('Disconnected');
          setSensorStatus('Disconnected');
        }, 5000);
      }
    });

    return () => {
      // Cleanup: Unsubscribe from Firebase listener and clear timeout
      unsubscribe();
      clearTimeout(timeoutId);
    };
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
