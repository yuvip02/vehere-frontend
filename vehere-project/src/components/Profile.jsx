import { useState, useEffect } from "react";
import Draggable from "react-draggable";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const ProbeStats = () => {
  const [probes, setProbes] = useState([]);
  const [positions, setPositions] = useState(
    JSON.parse(localStorage.getItem("probePositions")) || {}
  );
  const [size, setSize] = useState({ width: 320, height: 160, fontSize: 16 });

  useEffect(() => {
    socket.on("probeData", (data) => {
      console.log("📡 New Data from WebSocket:", data);
      setProbes([data]);
    });

    return () => {
      socket.off("probeData");
    };
  }, []);

  const handleDragStop = (e, data, id) => {
    const newPositions = { ...positions, [id]: { x: data.x, y: data.y } };
    setPositions(newPositions);
    localStorage.setItem("probePositions", JSON.stringify(newPositions));
  };

  const increaseSize = () => {
    setSize((prev) => ({
      width: prev.width + 20,
      height: prev.height + 20,
      fontSize: prev.fontSize + 2,
    }));
  };

  const decreaseSize = () => {
    setSize((prev) => ({
      width: prev.width - 20,
      height: prev.height - 20,
      fontSize: prev.fontSize - 2,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">Probe Statistics</h1>
      <div className="relative w-full h-full">
        {probes.length > 0 ? (
          probes.map((probe) => (
            <Draggable
              key={probe.id}
              defaultPosition={positions[probe.id] || { x: 0, y: 0 }}
              onStop={(e, data) => handleDragStop(e, data, probe.id)}
            >
              <div
                className="bg-blue-200 border border-gray-400 rounded p-4 shadow cursor-grab relative"
                style={{
                  width: size.width,
                  height: size.height,
                  fontSize: `${size.fontSize}px`,
                }}
              >
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={increaseSize}
                    className="bg-green-500 text-white px-2 py-1 text-xs rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={decreaseSize}
                    className="bg-red-500 text-white px-2 py-1 text-xs rounded"
                  >
                    -
                  </button>
                </div>
                <h2 className="text-lg font-semibold">{probe.id}</h2>
                <p>Bandwidth: {probe.total}</p>
                <p>Received: {probe.gbps_recv}</p>
                <p>Dropped: {probe.recv_drop}</p>
                <p>Sent: {probe.sent}</p>
              </div>
            </Draggable>
          ))
        ) : (
          <p className="text-gray-500">No data available...</p>
        )}
      </div>
    </div>
  );
};

export default ProbeStats;
