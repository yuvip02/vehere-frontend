import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");
const BANDWIDTH_THRESHOLD_KBPS =
  import.meta.env.VITE_BANDWIDTH_THRESHOLD_KBPS || 29000;
const STORAGE_KEY = "bandwidthData";

const HighBandwidthProbes = () => {
  const [bandwidthData, setBandwidthData] = useState(() => {
    try {
      const storedData = sessionStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.warn("Error parsing persisted data:", error);
      return [];
    }
  });

  const latestRef = useRef({});

  const updateData = (data) => {
    if (!Array.isArray(data)) return;

    data.forEach((probe) => {
      if (probe.isLogstash) return;

      const hostname = probe.hostname;
      const totalStr = probe.ports ? probe.ports[0] : "0";
      const total = totalStr.split(" ")[0];
      const timestamp =
        probe.bandwidthTimestamp || new Date().toLocaleString("en-IN");

      if (parseFloat(total) < BANDWIDTH_THRESHOLD_KBPS) {
        if (!latestRef.current[hostname]) {
          latestRef.current[hostname] = {
            hostname,
            total: totalStr,
            timestamp,
          };
        }
      } else {
        delete latestRef.current[hostname];
      }
    });

    const updatedData = Object.values(latestRef.current);
    setBandwidthData(updatedData);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  };

  const fetchInitialData = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/log-data");
      const data = await response.json();
      updateData(data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
    socket.on("probeData", updateData);

    return () => {
      socket.off("probeData", updateData);
    };
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-[32rem] h-[16rem] overflow-y-auto">
      <h3 className="text-xl font-bold text-red-500 mb-3">
        High Bandwidth Probes
      </h3>
      {bandwidthData.length === 0 ? (
        <p className="text-gray-500">No high bandwidth probes.</p>
      ) : (
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="border-b">
              <th className="py-1 px-2 text-left w-1/3">Device Name</th>
              <th className="py-1 px-2 text-right w-1/3">Total Bandwidth</th>
              <th className="py-1 px-2 text-left w-1/3">Down Since</th>
            </tr>
          </thead>
          <tbody>
            {bandwidthData.map((item, index) => {
              const totalParts = item.total.split(" ");
              const totalValue = totalParts[0];
              const totalUnit = totalParts[1];

              return (
                <tr key={index} className="border-b">
                  <td className="py-1 px-2">{item.hostname}</td>
                  <td className="py-1 px-2 text-right text-red-600">
                    {totalValue} <span className="text-left">{totalUnit}</span>
                  </td>
                  <td className="py-1 px-2 text-left text-gray-600">
                    {item.timestamp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HighBandwidthProbes;
