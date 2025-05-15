import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

let latestServicesData = [];

const GRID_LAYOUT = [
  [
    { ip: "192.168.17.14", label: "LS #01", role: "Logstash" },
    null,
    { ip: "192.168.17.49", label: "DN #25", role: "Elasticsearch" },
    { ip: "192.168.17.64", label: "DN #40", role: "Elasticsearch" },
    { ip: "192.168.17.79", label: "DN #55", role: "Elasticsearch" },
    { ip: "192.168.17.94", label: "DN #70", role: "Elasticsearch" },
    null,
    null,
  ],
  [
    { ip: "192.168.17.15", label: "LS #02", role: "Logstash" },
    { ip: "192.168.17.13", label: "CMS #3", role: "Elasticsearch | Kibana" },
    { ip: "192.168.17.48", label: "DN #24", role: "Elasticsearch" },
    { ip: "192.168.17.63", label: "DN #39", role: "Elasticsearch" },
    { ip: "192.168.17.78", label: "DN #54", role: "Elasticsearch" },
    { ip: "192.168.17.93", label: "DN #69", role: "Elasticsearch" },
    null,
    null,
  ],
  [
    { ip: "192.168.17.16", label: "LS #03", role: "Logstash" },
    { ip: "192.168.15.24", label: "MN #3", role: "Elasticsearch" },
    { ip: "192.168.17.47", label: "DN #23", role: "Elasticsearch" },
    { ip: "192.168.17.62", label: "DN #38", role: "Elasticsearch" },
    { ip: "192.168.17.77", label: "DN #53", role: "Elasticsearch" },
    { ip: "192.168.17.92", label: "DN #68", role: "Elasticsearch" },
    null,
    null,
  ],
  [
    { ip: "192.168.17.17", label: "LS #04", role: "Logstash" },
    { ip: "192.168.17.23", label: "MN #2", role: "Elasticsearch" },
    { ip: "192.168.17.46", label: "DN #21", role: "Elasticsearch" },
    { ip: "192.168.17.61", label: "DN #37", role: "Elasticsearch" },
    { ip: "192.168.17.76", label: "DN #52", role: "Elasticsearch" },
    { ip: "192.168.17.91", label: "DN #67", role: "Elasticsearch" },
    null,
    null,
  ],
  [
    { ip: "192.168.17.18", label: "LS #05", role: "Logstash" },
    { ip: "192.168.17.22", label: "MN #1", role: "Elasticsearch" },
    { ip: "192.168.17.45", label: "DN #21", role: "Elasticsearch" },
    { ip: "192.168.17.60", label: "DN #36", role: "Elasticsearch" },
    { ip: "192.168.17.75", label: "DN #51", role: "Elasticsearch" },
    { ip: "192.168.17.90", label: "DN #66", role: "Elasticsearch" },
    { ip: "192.168.24.124", label: "Probe #11", role: "Probe | Recon" },
    { ip: "192.168.24.113", label: "LB #02", role: "LB | Recon" },
  ],
  [
    { ip: "192.168.17.11", label: "CMS #1", role: "Elasticsearch | Kibana" },
    { ip: "192.168.17.34", label: "DN #10", role: "Elasticsearch" },
    { ip: "192.168.17.44", label: "DN #20", role: "Elasticsearch" },
    { ip: "192.168.17.59", label: "DN #35", role: "Elasticsearch" },
    { ip: "192.168.17.74", label: "DN #50", role: "Elasticsearch" },
    { ip: "192.168.17.89", label: "DN #65", role: "Elasticsearch" },
    { ip: "192.168.24.123", label: "Probe #10", role: "Probe | Recon" },
    { ip: "192.168.24.112", label: "LB #01", role: "LB | Recon" },
  ],
  [
    { ip: "192.168.17.12", label: "CMS #2", role: "Elasticsearch | Kibana" },
    { ip: "192.168.17.33", label: "DN #9", role: "Elasticsearch" },
    { ip: "192.168.17.43", label: "DN #19", role: "Elasticsearch" },
    { ip: "192.168.17.58", label: "DN #34", role: "Elasticsearch" },
    { ip: "192.168.17.73", label: "DN #49", role: "Elasticsearch" },
    { ip: "192.168.17.88", label: "DN #64", role: "Elasticsearch" },
    { ip: "192.168.24.122", label: "Probe #9", role: "Probe | Recon" },
    { ip: "192.168.24.132", label: "Probe #19", role: "Probe | Recon" },
  ],
  [
    { ip: "192.168.17.98", label: "OCR #1", role: "OCR" },
    { ip: "192.168.17.32", label: "DN #8", role: "Elasticsearch" },
    { ip: "192.168.17.42", label: "DN #18", role: "Elasticsearch" },
    { ip: "192.168.17.57", label: "DN #33", role: "Elasticsearch" },
    { ip: "192.168.17.72", label: "DN #48", role: "Elasticsearch" },
    { ip: "192.168.17.87", label: "DN #63", role: "Elasticsearch" },
    { ip: "192.168.24.121", label: "Probe #8", role: "Probe | Recon" },
    { ip: "192.168.24.131", label: "Probe #18", role: "Probe | Recon" },
  ],
  [
    { ip: "192.168.17.99", label: "OCR #2", role: "OCR" },
    { ip: "192.168.17.31", label: "DN #7", role: "Elasticsearch" },
    { ip: "192.168.17.41", label: "DN #47", role: "Elasticsearch" },
    { ip: "192.168.17.56", label: "DN #32", role: "Elasticsearch" },
    { ip: "192.168.17.71", label: "DN #47", role: "Elasticsearch" },
    { ip: "192.168.17.86", label: "DN #62", role: "Elasticsearch" },
    { ip: "192.168.24.120", label: "Probe #7", role: "Probe | Recon" },
    { ip: "192.168.24.130", label: "Probe #17", role: "Probe | Recon" },
  ],
  [
    { ip: "192.168.17.19", label: "ML #1", role: "ML | BP" },
    { ip: "192.168.17.30", label: "DN #6", role: "Elasticsearch" },
    { ip: "192.168.17.40", label: "DN #16", role: "Elasticsearch" },
    { ip: "192.168.17.55", label: "DN #31", role: "Elasticsearch" },
    { ip: "192.168.17.70", label: "DN #46", role: "Elasticsearch" },
    { ip: "192.168.17.85", label: "DN #61", role: "Elasticsearch" },
    { ip: "192.168.24.119", label: "Probe #6", role: "Probe | Recon" },
    { ip: "192.168.24.129", label: "Probe #16", role: "Probe | Recon" },
  ],
  [
    { ip: "192.168.17.20", label: "ML #2", role: "ML | BP" },
    { ip: "192.168.17.29", label: "DN #5", role: "Elasticsearch" },
    { ip: "192.168.17.39", label: "DN #45", role: "Elasticsearch" },
    { ip: "192.168.17.54", label: "DN #30", role: "Elasticsearch" },
    { ip: "192.168.17.69", label: "DN #44", role: "Elasticsearch" },
    { ip: "192.168.17.84", label: "DN #60", role: "Elasticsearch" },
    { ip: "192.168.24.118", label: "Probe #5", role: "Probe | Recon" },
    { ip: "192.168.24.128", label: "Probe #15", role: "Probe | Recon" },
  ],
  [
    { ip: "192.168.17.21", label: "ML #3", role: "ML | BP" },
    { ip: "192.168.17.28", label: "DN #4", role: "Elasticsearch" },
    { ip: "192.168.17.38", label: "DN #14", role: "Elasticsearch" },
    { ip: "192.168.17.53", label: "DN #29", role: "Elasticsearch" },
    { ip: "192.168.17.68", label: "DN #44", role: "Elasticsearch" },
    { ip: "192.168.17.83", label: "DN #59", role: "Elasticsearch" },
    { ip: "192.168.24.117", label: "Probe #4", role: "Probe | Recon" },
    { ip: "192.168.24.127", label: "Probe #14", role: "Probe | Recon" },
  ],
  [
    { ip: "192.168.17.95", label: "SID LID #1", role: "LID | SID" },
    { ip: "192.168.17.27", label: "DN #3", role: "Elasticsearch" },
    { ip: "192.168.17.37", label: "DN #13", role: "Elasticsearch" },
    { ip: "192.168.17.52", label: "DN #28", role: "Elasticsearch" },
    { ip: "192.168.17.67", label: "DN #43", role: "Elasticsearch" },
    { ip: "192.168.17.82", label: "DN #58", role: "Elasticsearch" },
    { ip: "192.168.24.116", label: "Probe #3", role: "Probe | Recon" },
    { ip: "192.168.24.126", label: "Probe #13", role: "Probe | Recon" },
  ],
  [
    { ip: "192.168.17.96", label: "SID LID #2", role: "SID | LID" },
    { ip: "192.168.17.26", label: "DN #2", role: "Elasticsearch" },
    { ip: "192.168.17.36", label: "DN #12", role: "Elasticsearch" },
    { ip: "192.168.17.51", label: "DN #27", role: "Elasticsearch" },
    { ip: "192.168.17.66", label: "DN #42", role: "Elasticsearch" },
    { ip: "192.168.17.81", label: "DN #57", role: "Elasticsearch" },
    { ip: "192.168.24.115", label: "Probe #2", role: "Probe | Recon" },
    { ip: "192.168.24.125", label: "Probe #12", role: "Probe | Recon" },
  ],
  [
    { ip: "192.168.17.97", label: "SID LID #3", role: "SID | LID" },
    { ip: "192.168.17.25", label: "DN #1", role: "Elasticsearch" },
    { ip: "192.168.17.35", label: "DN #11", role: "Elasticsearch" },
    { ip: "192.168.17.50", label: "DN #26", role: "Elasticsearch" },
    { ip: "192.168.17.65", label: "DN #41", role: "Elasticsearch" },
    { ip: "192.168.17.80", label: "DN #55", role: "Elasticsearch" },
    { ip: "192.168.24.114", label: "Probe #1", role: "Probe | Recon" },
    { ip: "192.168.24.111", label: "Probe 1G", role: "Probe | Recon" },
    // { ip: "192.168.2.95", label: "Probe TESTING", role: "Probe | Recon" },
  ],
];

const Services = () => {
  const [data, setData] = useState(latestServicesData);

  useEffect(() => {
    const handleStatus = (incoming) => {
      if (Array.isArray(incoming)) {
        latestServicesData = incoming;
        setData(incoming);
      }
    };

    socket.on("servicesStatus", handleStatus);
    return () => socket.off("servicesStatus", handleStatus);
  }, []);

  const getServiceStatusClass = (ip, role) => {
    const found = data.find((entry) => entry.ip === ip);
    if (!found) return "bg-red-800 text-white";

    const serviceNames = role.split("|").map((r) => r.trim().toLowerCase());
    const statuses = serviceNames.map((name) => found.services?.[name]);

    const activeCount = statuses.filter((s) => s === "active").length;

    if (activeCount === serviceNames.length) return "bg-green-500 text-white";
    if (activeCount > 0) return "bg-yellow-300 text-black";
    return "bg-red-800 text-white";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-900">
        Services Status Table
      </h2>

      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-[8px] bg-gray-300 mx-auto">
          <tbody>
            {GRID_LAYOUT.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, colIdx) => {
                  if (!cell || cell.empty) {
                    return (
                      <td
                        key={colIdx}
                        className="w-[150px] h-[90px] bg-transparent"
                      />
                    );
                  }

                  const cellClass = getServiceStatusClass(cell.ip, cell.role);

                  return (
                    <td
                      key={colIdx}
                      className={`text-center rounded p-2 w-[150px] h-[90px] shadow ${cellClass}`}
                    >
                      <div className="font-semibold text-sm">{cell.label}</div>
                      <div className="text-xs">{cell.ip}</div>

                      <div className="flex flex-wrap justify-center gap-1 mt-1 text-xs">
                        {cell.role.split("|").map((service) => {
                          const name = service.trim().toLowerCase();
                          const found = data.find((d) => d.ip === cell.ip);
                          const status = found?.services?.[name];
                          const badgeColor =
                            status === "active"
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white";

                          return (
                            <span
                              key={name}
                              className={`px-1 rounded ${badgeColor}`}
                            >
                              {service.trim()}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Services;
