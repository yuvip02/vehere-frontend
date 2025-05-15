import { useEffect, useState, useRef } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

import io from "socket.io-client";

const socket = io("http://localhost:3000");

const LogstashFileCountTable = () => {
  const [logstashData, setLogstashData] = useState([]);
  const latestDataRef = useRef([]);

  useEffect(() => {
    socket.on("probeData", (newData) => {
      if (Array.isArray(newData)) {
        const filtered = newData.filter((p) => p.isLogstash === true);

        setLogstashData((prevData) => {
          const updated = [...prevData];
          filtered.forEach((incoming) => {
            const index = updated.findIndex((p) => p.ip === incoming.ip);
            if (index !== -1) {
              updated[index] = {
                ...updated[index],
                ...incoming,
                fileCounts: {
                  ...updated[index].fileCounts,
                  ...incoming.fileCounts,
                },
              };
            } else {
              updated.push(incoming);
            }
          });
          return updated;
        });

        latestDataRef.current = filtered;
      }
    });

    return () => socket.off("probeData");
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Logstash File Counts
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-[#c0262e] text-white">
            <tr>
              <th className="py-3 px-6">IP Address</th>
              <th className="py-3 px-6">Hostname</th>
              <th className="py-3 px-6">Status</th>
              {Array.from({ length: 10 }).map((_, index) => (
                <th key={index} className="py-3 px-6">{`ipdr${index}`}</th>
              ))}
              <th className="py-3 px-6">Recon</th>
              <th className="py-3 px-6">Logstash Status</th>{" "}
            </tr>
          </thead>
          <tbody>
            {logstashData.length > 0 ? (
              logstashData.map((log, index) => (
                <tr key={index} className="border-b bg-white">
                  <td className="py-3 px-6 text-center">{log.ip || "-"}</td>
                  <td className="py-3 px-6 text-center">
                    {log.hostname || "-"}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {log.status === "Active" ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-500 mx-auto" />
                    )}
                  </td>
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <td key={idx} className="py-3 px-6 text-center">
                      {log.fileCounts?.[`ipdr${idx}`] ?? "-"}
                    </td>
                  ))}
                  <td className="py-3 px-6 text-center">
                    {log.fileCounts?.recon ?? "-"}
                  </td>
                  <td
                    className={`py-3 px-6 text-center font-bold ${
                      log.logstashServiceStatus === "Active"
                        ? "bg-green-500 text-white"
                        : log.logstashServiceStatus === "Inactive"
                        ? "bg-red-500 text-white"
                        : ""
                    }`}
                  >
                    {log.logstashServiceStatus || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} className="py-4 text-center text-gray-500">
                  Waiting for logstash data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogstashFileCountTable;
