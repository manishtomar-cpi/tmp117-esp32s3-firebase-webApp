export default function Header() {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 justify-normal">
          Real-Time Dashboard for Temperature Sensor
        </h1>
        <p className="text-lg text-gray-600">
          Using an ESP32-S3 board with a TMP117 sensor to send real-time temperature data to Firebase and display it on a web dashboard.
        </p>
      </div>
    );
  }
  