"use client"
import { useState, useEffect } from 'react';
import { database } from '../../firebase';
import Header from './components/Header';
import TemperatureDisplay from './components/TemperatureDisplay';
import StatusDisplay from './components/StatusDisplay';
import LineGraph from './components/LineGraph';
import BarGraph from './components/BarGraph';
import Filters from './components/Filters';
import TemperatureCalendar from './components/TemperatureCalendar';

export default function MainPage() {
  const [selectedGraph, setSelectedGraph] = useState('line'); // Line graph by default

  useEffect(() => {
    if (database) {
      console.log('Connected to Firebase successfully');
    } else {
      console.log('Failed to connect to Firebase');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <Header />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,3fr] gap-4">
        {/* Left Column - Temperature and Status */}
        <div className="space-y-4 w-full">
          <TemperatureDisplay />
          <StatusDisplay />
          <div className="hidden md:block"> {/* Hidden on mobile, visible on desktop */}
            <TemperatureCalendar />
          </div>
        </div>

        {/* Right Column - Graphs and Filters */}
        <div className="space-y-4 w-full">
          {/* Graph Toggle Buttons */}
          <div className="flex justify-left space-x-4">
            <button
              className={`px-4 py-2 font-semibold rounded-lg ${selectedGraph === 'line' ? 'bg-sky-400 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedGraph('line')}
            >
              Line Graph
            </button>
            <button
              className={`px-4 py-2 font-semibold rounded-lg ${selectedGraph === 'bar' ? 'bg-sky-400 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedGraph('bar')}
            >
              Bar Graph
            </button>
          </div>

          {/* Full Width for Graph and Filters */}
          <div className="space-y-4">
            {/* Graph Div with Full Width */}
            <div className="p-4 bg-white shadow-md rounded-lg w-full mx-auto"> {/* Full width */}
              {selectedGraph === 'line' ? <LineGraph /> : <BarGraph />}
            </div>

            {/* Filters with Full Width */}
            <div className="p-4 bg-white shadow-md rounded-lg w-full mx-auto"> {/* Full width */}
              <Filters />
            </div>
            <div className="block md:hidden"> {/* Hidden on desktop, visible on mobile */}
            <TemperatureCalendar />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
