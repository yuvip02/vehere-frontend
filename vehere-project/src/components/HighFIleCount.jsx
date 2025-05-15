import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");
const STORAGE_KEY = "fileCountData";
const THRESHOLD = import.meta.env.VITE_PROBE_THRESHOLD || 0;

const HighFileCountBox = () => {
  const [fileCountServers, setFileCountServers] = useState(() => {
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

    data
      .filter((server) => !server.isLogstash) 
      .forEach((server) => {
        const { hostname = "-", fileCounts = {} } = server;

        const entries = Object.entries(fileCounts).filter(
          ([key, value]) =>
            (key.startsWith("ipdr") || key === "recon") && value > THRESHOLD
        );

        if (entries.length > 0) {
          const existing = latestRef.current[hostname];

          const formattedTimestamp =
            existing?.timestamp ||
            new Date().toLocaleString("en-IN", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            });

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
    setFileCountServers(updatedData);
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
        Probe High File Count
      </h3>
      {fileCountServers.length === 0 ? (
        <p className="text-gray-500">No high file counts detected.</p>
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
            {fileCountServers.map((item, index) => (
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

export default HighFileCountBox;
