import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ref, get } from 'firebase/database';
import { database } from '../../../firebase';
import { format } from 'date-fns';

export default function Filters() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [temperatureData, setTemperatureData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null); // State to manage error message

  useEffect(() => {
    fetchDatabaseDateRange(); // Fetch available date range on component mount
  }, []);

  // Function to round the time to the nearest 5 minutes
  const roundToNearestFiveMinutes = (date) => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 5) * 5;
    return new Date(date.setMinutes(roundedMinutes, 0, 0));
  };

  // Fetch the start and end dates of available data in Firebase
  const fetchDatabaseDateRange = async () => {
    const tempRef = ref(database, 'sensor/data');
    const snapshot = await get(tempRef);

    if (snapshot.exists()) {
      const data = Object.values(snapshot.val());

      const timestamps = data.map((entry) => new Date(entry.timestamp));
      const sortedTimestamps = timestamps.sort((a, b) => a - b);

      // Set the start and end dates of the data in the database
      setStartDate(sortedTimestamps[0]);
      setEndDate(sortedTimestamps[sortedTimestamps.length - 1]);
    }
  };

  const handleSearch = async () => {
    // Round the selected date to the nearest 5 minutes
    const roundedDate = roundToNearestFiveMinutes(selectedDate);
    const formattedDate = format(roundedDate, 'dd-MM-yyyy HH:mm:ss');

    // Query Firebase for the temperature data
    const tempRef = ref(database, 'sensor/data');
    const snapshot = await get(tempRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      let nearestTemperature = null;
      let nearestTimeDiff = Infinity;

      // Search for the closest timestamp in Firebase data
      Object.values(data).forEach((entry) => {
        const entryDate = new Date(entry.timestamp);
        const timeDiff = Math.abs(entryDate - roundedDate);

        if (timeDiff < nearestTimeDiff) {
          nearestTimeDiff = timeDiff;
          nearestTemperature = entry.temperature;
        }
      });

      // If the selected date is outside the available range, notify the user
      if (roundedDate < startDate || roundedDate > endDate) {
        setErrorMessage(
          `No data available for the selected date. Available data is from ${format(
            startDate,
            'dd-MM-yyyy HH:mm:ss'
          )} to ${format(endDate, 'dd-MM-yyyy HH:mm:ss')}.`
        );

        // Start the timer to clear the error after 3 seconds
        setTimeout(() => {
          setErrorMessage(null); // Clear the error message after 3 seconds
        }, 5000);
      } else if (nearestTemperature !== null) {
        // Update state with the closest temperature data
        setTemperatureData({
          date: formattedDate,
          temperature: nearestTemperature,
        });
      } else {
        setTemperatureData({ error: 'No data found for the selected time' });
      }
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg w-full">
      <h2 className="text-lg font-semibold mb-4">Search Temperature by Date and Time</h2>
      
      {/* Date and Time Picker */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Select Date and Time</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showTimeSelect
          timeIntervals={5} // Allow selecting time in 5-minute intervals
          dateFormat="Pp"
          className="border rounded-md p-2 w-48"
        />
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-sky-400 text-white rounded-lg w-48"
      >
        Search Temperature
      </button>

      {/* Display Search Result */}
      {temperatureData && !errorMessage && (
        <div className="mt-4">
          {temperatureData.error ? (
            <p className="text-red-500">{temperatureData.error}</p>
          ) : (
            <p className="text-lg">
              Temperature at {temperatureData.date}:{' '}
              <span className="font-semibold">{temperatureData.temperature}°C</span>
            </p>
          )}
        </div>
      )}

      {/* Error Message with 3 Seconds Timer */}
      {errorMessage && (
        <div className="mt-4">
          <p className="text-red-500">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
