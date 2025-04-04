import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const FileCountTable = () => {
  const [probeData, setProbeData] = useState([]); // ✅ Stores all probes
  const latestDataRef = useRef([]);

  useEffect(() => {
    socket.on("probeData", (newData) => {
      if (Array.isArray(newData)) {
        console.log("🔹 Received new data:", newData);

        setProbeData((prevData) => {
          const updatedProbes = [...prevData]; // Keep existing probes

          newData.forEach((newProbe) => {
            const index = updatedProbes.findIndex((p) => p.ip === newProbe.ip);
            if (index !== -1) {
              // ✅ Update existing probe
              updatedProbes[index] = {
                ...updatedProbes[index],
                ...newProbe,
                fileCounts: {
                  ...updatedProbes[index].fileCounts,
                  ...newProbe.fileCounts,
                },
              };
            } else {
              // ✅ Add new probe if not found
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
                    {probe.status === "Active" ? "✅" : "❌"}
                  </td>
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <td key={idx} className="py-3 px-6 text-center">
                      {probe.fileCounts?.[`ipdr${idx}`] ?? "-"}
                    </td>
                  ))}
                  <td className="py-3 px-6 text-center">
                    {probe.fileCounts?.recon ?? "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="py-4 text-center text-gray-500">
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
