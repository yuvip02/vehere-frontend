import { useEffect, useState } from "react";
import io from "socket.io-client";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid"; 

const socket = io("http://localhost:3000");

const Table = () => {
  const [probeData, setProbeData] = useState([]);
  const maxPorts = 4; 

  useEffect(() => {
    socket.on("probeData", (data) => {
      if (Array.isArray(data)) {
        const normalProbes = data.filter((p) => !p.isLogstash);  
        setProbeData(normalProbes);
      }
    });

    return () => socket.off("probeData");
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Probe Statistics
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-[#c0262e] text-white">
            <tr>
              <th className="py-3 px-6">IP Address</th>
              <th className="py-3 px-6">Hostname</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Total Bandwidth</th>
              {Array.from({ length: maxPorts }).map((_, index) => (
                <th key={index} className="py-3 px-6">{`Port ${index + 1}`}</th>
              ))}
              <th className="py-3 px-6">Received</th>
              <th className="py-3 px-6">Dropped</th>
              <th className="py-3 px-6">Sent</th>
              <th className="py-3 px-6">Probe Service</th>
              <th className="py-3 px-6">Recon Service</th>
            </tr>
          </thead>
          <tbody>
            {probeData.length > 0 ? (
              probeData.map((probe, index) => (
                <tr key={index} className="border-b bg-white">
                  <td className="py-3 px-6 text-center">{probe.ip}</td>
                  <td className="py-3 px-6 text-center">{probe.hostname}</td>

                  <td className="py-3 px-6 text-center">
                    {probe.status === "Active" ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-500 mx-auto" />
                    )}
                  </td>

                  <td className="py-3 px-6 text-center">{probe.total}</td>

                  {Array.from({ length: maxPorts }).map((_, idx) => (
                    <td key={idx} className="py-3 px-6 text-center">
                      {probe.ports?.[idx] || "-"}
                    </td>
                  ))}

                  <td className="py-3 px-6 text-center">{probe.gbps_recv}</td>
                  <td className="py-3 px-6 text-center">{probe.recv_drop}</td>
                  <td className="py-3 px-6 text-center">{probe.sent}</td>

                  <td
                    className={`py-3 px-6 text-center font-bold ${
                      probe.services?.probe === "Active"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {probe.services?.probe || "Inactive"}
                  </td>

                  <td
                    className={`py-3 px-6 text-center font-bold ${
                      probe.services?.recon === "Active"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {probe.services?.recon || "Inactive"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={11}
                  className="py-3 px-6 text-center text-gray-500"
                >
                  No probe data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
