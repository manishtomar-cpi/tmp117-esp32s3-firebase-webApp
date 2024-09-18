import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function LineGraph() {
  // Define colors for different temperature conditions
  const defaultLineColor = 'rgba(75,192,192,1)';   // Default line color (Cyan)
  const above30Color = 'rgba(255,69,0,1)';         // Red-Orange for above 30°C
  const below20Color = 'rgba(0,191,255,1)';        // Deep Sky Blue for below 20°C
  const suddenIncreaseColor = 'rgba(255,165,0,1)'; // Orange for sharp increase
  const suddenDecreaseColor = 'rgba(255,105,180,1)';// Pink for sharp decrease

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [],
        borderColor: [],
        backgroundColor: 'rgba(75,192,192,0.2)', // Default background color
        tension: 0.4,
        fill: true,
        pointRadius: 5, // Slightly larger dots for visibility
        pointBackgroundColor: [],
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

        // Custom logic for colors based on temperature changes
        const newBorderColor = [];
        const newPointColors = [];

        newData.forEach((value, index) => {
          // Default border color
          let borderColor = defaultLineColor; // Default line color
          let pointColor = defaultLineColor;  // Default point color

          // Change the line color based on temperature range
          if (value > 30) {
            borderColor = above30Color; // Above 30°C line color
          } else if (value < 20) {
            borderColor = below20Color; // Below 20°C line color
          }

          // Detect sudden increase or decrease and change the point color
          if (index > 0) {
            const previousValue = newData[index - 1];
            if (value > previousValue) {
              pointColor = suddenIncreaseColor; // Orange for increase
            } else if (value < previousValue) {
              pointColor = suddenDecreaseColor; // Pink for decrease
            }
          }

          newBorderColor.push(borderColor);
          newPointColors.push(pointColor);
        });

        // Update the chart data
        setChartData({
          labels: newLabels,
          datasets: [
            {
              label: 'Temperature (°C)',
              data: newData,
              borderColor: newBorderColor, // Apply custom border colors
              backgroundColor: 'rgba(75,192,192,0.2)',
              tension: 0.4,
              fill: true,
              pointRadius: 5,
              pointBackgroundColor: newPointColors, // Apply custom point colors
            },
          ],
        });
      }
    });
  }, []);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg w-full mx-auto">

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Real-Time Temperature Graph</h2>
      <div className="relative h-72">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                display: false, // No timestamps on x-axis
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
                max: 50, // Adjust based on your range
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
                        fillStyle: defaultLineColor,
                        strokeStyle: defaultLineColor,
                        pointStyle: 'line', // Line indicator
                      },
                      {
                        text: "Above 30°C",
                        fillStyle: above30Color,
                        strokeStyle: above30Color,
                        pointStyle: 'line',
                      },
                      {
                        text: "Below 20°C",
                        fillStyle: below20Color,
                        strokeStyle: below20Color,
                        pointStyle: 'line',
                      },
                      {
                        text: "Sudden Increase (Orange Dot)",
                        fillStyle: suddenIncreaseColor,
                        strokeStyle: suddenIncreaseColor,
                        pointStyle: 'circle', // Dot indicator
                      },
                      {
                        text: "Sudden Decrease (Pink Dot)",
                        fillStyle: suddenDecreaseColor,
                        strokeStyle: suddenDecreaseColor,
                        pointStyle: 'circle',
                      }
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
