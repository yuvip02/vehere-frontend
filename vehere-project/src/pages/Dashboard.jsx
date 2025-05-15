import HighBandwidthProbes from "../components/HighBandwidthProbes";
import HighFileCountBox from "../components/HighFIleCount";
import HighFileCountLogstash from "../components/HighFileCountLogstash";
import ServicesDownBox from "../components/ServicesDownBox";

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">
        Monitoring Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center p-4">
        <ServicesDownBox />
        <HighFileCountBox />
        <HighFileCountLogstash />
        <HighBandwidthProbes />
      </div>
    </div>
  );
};

export default Dashboard;
