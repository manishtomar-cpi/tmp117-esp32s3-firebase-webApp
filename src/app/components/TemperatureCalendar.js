import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase'; // Adjust the path to your Firebase setup
import { format } from 'date-fns';

const timeSlots = [
    '12:00 AM', '12:15 AM', '12:30 AM', '12:45 AM', '01:00 AM', '01:15 AM', '01:30 AM', '01:45 AM',
    '02:00 AM', '02:15 AM', '02:30 AM', '02:45 AM', '03:00 AM', '03:15 AM', '03:30 AM', '03:45 AM',
    '04:00 AM', '04:15 AM', '04:30 AM', '04:45 AM', '05:00 AM', '05:15 AM', '05:30 AM', '05:45 AM',
    '06:00 AM', '06:15 AM', '06:30 AM', '06:45 AM', '07:00 AM', '07:15 AM', '07:30 AM', '07:45 AM',
    '08:00 AM', '08:15 AM', '08:30 AM', '08:45 AM', '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
    '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM', '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
    '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM', '01:00 PM', '01:15 PM', '01:30 PM', '01:45 PM',
    '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM', '03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM',
    '04:00 PM', '04:15 PM', '04:30 PM', '04:45 PM', '05:00 PM', '05:15 PM', '05:30 PM', '05:45 PM',
    '06:00 PM', '06:15 PM', '06:30 PM', '06:45 PM', '07:00 PM', '07:15 PM', '07:30 PM', '07:45 PM',
    '08:00 PM', '08:15 PM', '08:30 PM', '08:45 PM', '09:00 PM', '09:15 PM', '09:30 PM', '09:45 PM',
    '10:00 PM', '10:15 PM', '10:30 PM', '10:45 PM', '11:00 PM', '11:15 PM', '11:30 PM', '11:45 PM'
  ];
  

export default function TemperatureCalendar() {
  const [temperatureData, setTemperatureData] = useState({});
  const [currentPage, setCurrentPage] = useState(0); // Track the current page of time slots
  const itemsPerPage = 16; // Display 16 items (4 rows x 4 columns)

  // Fetch temperature data from Firebase for the current day
  useEffect(() => {
    const tempRef = ref(database, 'sensor/data'); // Assuming 'sensor/data' path in Firebase

    onValue(tempRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const filteredData = {};
        Object.values(data).forEach((entry) => {
          const entryTime = format(new Date(entry.timestamp), 'hh:mm a'); // Format the timestamp
          filteredData[entryTime] = entry.temperature;
        });
        setTemperatureData(filteredData);
      }
    });
  }, []);

  // Paginated time slots for display
  const paginatedTimeSlots = timeSlots.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Handler for navigating forward and backward through time slots
  const handleNextPage = () => {
    if ((currentPage + 1) * itemsPerPage < timeSlots.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white shadow-md rounded-lg w-full"> {/* Added more padding for mobile */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Temperature Calendar for Today</h2>
      
      {/* Grid to display time slots */}
      <div className="grid grid-cols-4 gap-2 md:gap-4"> {/* Added smaller gaps for mobile */}
        {paginatedTimeSlots.map((time, index) => {
          const temp = temperatureData[time]; // Get temperature for the time slot
          const tempColor = temp > 30 ? 'text-red-500 border-red-500' : temp < 20 ? 'text-blue-500 border-blue-500' : 'text-sky-400 border-sky-400';
          return (
            <div
              key={index}
              className={`flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-full border-2 ${tempColor} md:mb-0 mb-2`} // Smaller circle size and margin on mobile
            >
              <div className="text-center">
                <p className="text-xs text-black">{time}</p>
                <p className="text-sm font-bold">{temp ? `${temp.toFixed(2)}°C` : '-'}</p> {/* Display temperature with 2 decimal points */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls with Arrows */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousPage}
          className={`px-4 py-2 text-sky-400 rounded-lg text-lg ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={currentPage === 0}
        >
          ←
        </button>
        <button
          onClick={handleNextPage}
          className={`px-4 py-2 text-sky-400 rounded-lg text-lg ${(currentPage + 1) * itemsPerPage >= timeSlots.length ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={(currentPage + 1) * itemsPerPage >= timeSlots.length}
        >
          →
        </button>
      </div>
    </div>
  );
}
