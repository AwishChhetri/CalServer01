import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';

const ResultPage = () => {
  const location = useLocation();
  const { tcoData } = location.state || {};

  if (!tcoData) {
    return <div>No data available.</div>;
  }

  const data = {
    labels: ['ICE', 'EV'],
    datasets: [
      {
        label: 'Total Cost of Ownership (TCO)',
        data: [tcoData.ice_tco, tcoData.ev_tco],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'ICE vs EV - Total Cost of Ownership (TCO)',
      },
    },
  };

  return (
    <div>
      <h2>Total Cost of Ownership (TCO) Comparison</h2>
      <Bar data={data} options={options} />
      <div>
        <h3>Breakdown:</h3>
        <div>
          <h4>ICE:</h4>
          <p>Purchase Price: {tcoData.breakdown.ice.purchasePrice}</p>
          <p>Fuel Cost: {tcoData.breakdown.ice.fuelCost}</p>
          <p>Maintenance Cost: {tcoData.breakdown.ice.maintenanceCost}</p>
          <p>Insurance Cost: {tcoData.breakdown.ice.insuranceCost}</p>
          <p>Resale Value: {tcoData.breakdown.ice.resaleValue}</p>
        </div>
        <div>
          <h4>EV:</h4>
          <p>Purchase Price: {tcoData.breakdown.ev.purchasePrice}</p>
          <p>Charging Cost: {tcoData.breakdown.ev.chargingCost}</p>
          <p>Maintenance Cost: {tcoData.breakdown.ev.maintenanceCost}</p>
          <p>Insurance Cost: {tcoData.breakdown.ev.insuranceCost}</p>
          <p>Battery Replacement Cost: {tcoData.breakdown.ev.batteryReplacementCost}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
