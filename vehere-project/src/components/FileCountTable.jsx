import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

const socket = io("http://localhost:3000");

const FileCountTable = () => {
  const [probeData, setProbeData] = useState([]);
  const latestDataRef = useRef([]);

  useEffect(() => {
    socket.on("probeData", (newData) => {
      if (Array.isArray(newData)) {
        console.log("🔹 Received new data:", newData);

        setProbeData((prevData) => {
          const updatedProbes = [...prevData];

          newData.forEach((newProbe) => {
            if (newProbe.isLogstash) return;

            const index = updatedProbes.findIndex((p) => p.ip === newProbe.ip);
            if (index !== -1) {
              updatedProbes[index] = {
                ...updatedProbes[index],
                ...newProbe,
                fileCounts: {
                  ...updatedProbes[index].fileCounts,
                  ...newProbe.fileCounts,
                },
              };
            } else {
              updatedProbes.push(newProbe);
            }
          });

          return updatedProbes;
        });

        latestDataRef.current = newData;
      }
    });

    return () => socket.off("probeData");
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-center">File Counts</h2>
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
              <th className="py-3 px-6">Recon Status</th>
            </tr>
          </thead>
          <tbody>
            {probeData.length > 0 ? (
              probeData.map((probe, index) => (
                <tr key={index} className="border-b bg-white">
                  <td className="py-3 px-6 text-center">{probe.ip || "-"}</td>
                  <td className="py-3 px-6 text-center">
                    {probe.hostname || "-"}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {probe.status === "Active" ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-500 mx-auto" />
                    )}
                  </td>
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <td key={idx} className="py-3 px-6 text-center">
                      {probe.fileCounts?.[`ipdr${idx}`] ?? "-"}
                    </td>
                  ))}
                  <td className="py-3 px-6 text-center">
                    {probe.fileCounts?.recon ?? "-"}
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
                <td colSpan={13} className="py-4 text-center text-gray-500">
                  Waiting for data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileCountTable;
