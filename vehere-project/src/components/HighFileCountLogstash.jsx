import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");
const STORAGE_KEY = "logstashFileCountData";
const THRESHOLD = import.meta.env.VITE_LOGSTASH_THRESHOLD || 0;

const fetchInitialData = async (updateData) => {
  try {
    const response = await fetch("http://localhost:3000/api/log-data");
    const data = await response.json();
    updateData(data);
  } catch (error) {
    console.error("Error fetching initial data:", error);
  }
};

const HighFileCountLogstash = () => {
  const [logstashCounts, setFileCounts] = useState(() => {
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
    if (!Array.isArray(data)) {
      console.warn("Data received is not an array:", data);
      return;
    }

    data
      .filter((server) => server.isLogstash) 
      .forEach((server) => {
        const { hostname = "-", fileCounts = {}, timestamp = null } = server;

        const entries = Object.entries(fileCounts).filter(([key, value]) => {
          const numericValue = parseFloat(value);
          return (
            (key.startsWith("ipdr") || key === "recon") &&
            numericValue > THRESHOLD
          );
        });

        if (entries.length > 0) {
          const formattedTimestamp =
            timestamp || new Date().toLocaleString("en-IN");

          let services = new Set();
          entries.forEach(([key]) => {
            if (key.startsWith("ipdr")) {
              services.add("ipdr");
            } else {
              services.add(key);
            }
          });

          latestRef.current[hostname] = {
            hostname,
            services: Array.from(services),
            timestamp: formattedTimestamp,
          };
        } else {
          delete latestRef.current[hostname];
        }
      });

    const updatedData = Object.values(latestRef.current);
    setFileCounts(updatedData);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  };

  useEffect(() => {
    fetchInitialData(updateData);
    socket.on("probeData", updateData);

    return () => {
      socket.off("probeData", updateData);
    };
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-[32rem] h-[16rem] overflow-y-auto">
      <h3 className="text-xl font-bold text-red-500 mb-3">
        Logstash File Count
      </h3>
      {logstashCounts.length === 0 ? (
        <p className="text-gray-500">No threshold breaches detected.</p>
      ) : (
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1 w-1/3">Device Name</th>
              <th className="py-1 w-1/3">Files Exceeding</th>
              <th className="py-1 w-1/3">Down Since</th>
            </tr>
          </thead>
          <tbody>
            {logstashCounts.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-1 font-semibold">{item.hostname}</td>
                <td className="py-1 text-red-600">
                  {item.services.join(", ")}
                </td>
                <td className="py-1 text-gray-600">{item.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HighFileCountLogstash;
