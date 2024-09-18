import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarGraph() {
  // Define colors for different temperature conditions
  const defaultBarColor = 'rgba(75,192,192,0.8)';   // Default bar color (Cyan)
  const above30Color = 'rgba(255,69,0,0.8)';         // Red-Orange for above 30°C
  const below20Color = 'rgba(0,191,255,0.8)';        // Deep Sky Blue for below 20°C
  const suddenIncreaseColor = 'rgba(255,165,0,1)';   // Orange for sharp increase
  const suddenDecreaseColor = 'rgba(255,105,180,1)'; // Pink for sharp decrease

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [],
        backgroundColor: [],
        borderColor: 'rgba(0, 0, 0, 0.1)', // Light border color for bars
        borderWidth: 1,
        barThickness: 25, // Thicker bars for a more striking design
      },
    ],
  });

  useEffect(() => {
    const tempRef = ref(database, 'sensor/data');

    onValue(tempRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedData = Object.values(data).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const newLabels = sortedData.map((entry) => entry.timestamp);
        const newData = sortedData.map((entry) => entry.temperature);

        // Custom logic for bar colors based on temperature changes
        const newBarColors = [];

        newData.forEach((value, index) => {
          // Default bar color
          let barColor = defaultBarColor; // Default bar color

          // Change the bar color based on temperature range
          if (value > 30) {
            barColor = above30Color; // Above 30°C bar color
          } else if (value < 20) {
            barColor = below20Color; // Below 20°C bar color
          }

          // Detect sudden increase or decrease and change the bar color
          if (index > 0) {
            const previousValue = newData[index - 1];
            if (value > previousValue) {
              barColor = suddenIncreaseColor; // Orange for increase
            } else if (value < previousValue) {
              barColor = suddenDecreaseColor; // Pink for decrease
            }
          }

          newBarColors.push(barColor);
        });

        // Update the chart data
        setChartData({
          labels: new Array(newData.length).fill(''), // Empty labels to hide the x-axis
          datasets: [
            {
              label: 'Temperature (°C)',
              data: newData,
              backgroundColor: newBarColors, // Apply custom bar colors
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1,
              barThickness: 25, // Thicker bars for better visuals
            },
          ],
        });
      }
    });
  }, []);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg w-full mx-auto">

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Real-Time Temperature Bar Graph</h2>
      <div className="relative h-72">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                display: false, // Hide the x-axis (no timestamp labels)
              },
              y: {
                title: {
                  display: true,
                  text: 'Temperature (°C)',
                  color: '#4B5563',
                  font: {
                    size: 14,
                    weight: 'bold',
                  },
                },
                min: 0,
                max: 50, // Adjust the range based on your needs
                ticks: {
                  color: '#4B5563',
                  font: {
                    size: 12,
                  },
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true, // Use circle markers in legend
                  generateLabels: (chart) => {
                    return [
                      {
                        text: "Default (20-30°C)",
                        fillStyle: defaultBarColor,
                      },
                      {
                        text: "Above 30°C",
                        fillStyle: above30Color,
                      },
                      {
                        text: "Below 20°C",
                        fillStyle: below20Color,
                      },
                      {
                        text: "Sudden Increase",
                        fillStyle: suddenIncreaseColor,
                      },
                      {
                        text: "Sudden Decrease",
                        fillStyle: suddenDecreaseColor,
                      },
                    ];
                  },
                },
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: (tooltipItem) => `Temperature: ${tooltipItem.raw}°C`,
                },
              },
            },
          }}
          height={250}
        />
      </div>
    </div>
  );
}
