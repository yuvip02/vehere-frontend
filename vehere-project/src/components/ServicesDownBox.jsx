import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");
const STORAGE_KEY = "downServicesData";

const ServicesDownBox = () => {
  const [downServices, setDownServices] = useState(() => {
    try {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      const parsedData = JSON.parse(savedData);
      return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      console.warn("Failed to parse session storage data:", error);
      return [];
    }
  });

  const latestRef = useRef({});

  useEffect(() => {
    const handleUpdate = (data) => {
      if (!Array.isArray(data)) return;

      data.forEach((server) => {
        const { hostname = "-", services = {}, downSince = null } = server;
        const allServices = Object.keys(services);

        const down = allServices.filter(
          (name) => (services[name] || "").toLowerCase() !== "active"
        );

        const timestamp = downSince
          ? new Date(downSince).toLocaleString("en-IN", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })
          : new Date().toLocaleString("en-IN", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            });

        if (down.length > 0) {
          const existing = latestRef.current[hostname];

          if (!existing) {
            latestRef.current[hostname] = {
              hostname,
              services: down,
              timestamp,
            };
          } else {
            const newlyDown = down.filter(
              (svc) => !existing.services.includes(svc)
            );

            if (newlyDown.length > 0) {
              latestRef.current[hostname].services = [
                ...existing.services,
                ...newlyDown,
              ];
              latestRef.current[hostname].timestamp = timestamp;
            }
          }
        } else {
          delete latestRef.current[hostname];
        }
      });

      const updatedData = Object.values(latestRef.current);
      setDownServices(updatedData);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    };

    socket.on("servicesStatus", handleUpdate);

    return () => {
      socket.off("servicesStatus", handleUpdate);
    };
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-[32rem] h-[16rem] overflow-y-auto">
      <h3 className="text-xl font-bold text-red-500 mb-3">
        Top Alert Service Down
      </h3>

      {Array.isArray(downServices) && downServices.length === 0 ? (
        <p className="text-gray-500">All services operational.</p>
      ) : (
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1 w-1/3">Device Name</th>
              <th className="py-1 w-1/3">Services Down</th>
              <th className="py-1 w-1/3">Down Since</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(downServices) ? (
              downServices.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-1 font-semibold">{item.hostname}</td>
                  <td className="py-1 text-red-800">
                    {item.services.join(", ")}
                  </td>
                  <td className="py-1 text-gray-600">{item.timestamp}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-2 text-gray-500">
                  Data is not available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ServicesDownBox;
