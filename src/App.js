import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { Bar, Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
Chart.register(...registerables);

function App() {
  const [icePrice, setIcePrice] = useState(1500000);
  const [iceMileage, setIceMileage] = useState(10);
  const [fuelCost, setFuelCost] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [evPrice, setEvPrice] = useState(2000000);
  const [evRange, setEvRange] = useState(200);
  const [batteryCapacity, setBatteryCapacity] = useState(30);
  const [chargingCost, setChargingCost] = useState(9.5);
  const [batteryReplacementCost, setBatteryReplacementCost] = useState(700000);
  const [batteryReplacementInterval, setBatteryReplacementInterval] = useState(6);

  const [monthlyKm, setMonthlyKm] = useState(3000);
  const [calculationDuration, setCalculationDuration] = useState(15);
  const [considerBatteryReplacement, setConsiderBatteryReplacement] = useState(true);

  const [tcoData, setTcoData] = useState(null); // State to store TCO data
  const [formValid, setFormValid] = useState(false); // State to track form validation

  const handleClick = async () => {
    setIsLoading(true); 
    // Input validation
    if (
      icePrice <= 0 ||
      iceMileage <= 0 ||
      fuelCost <= 0 ||
      evPrice <= 0 ||
      evRange <= 0 ||
      batteryCapacity <= 0 ||
      chargingCost <= 0 ||
      monthlyKm <= 0 ||
      calculationDuration <= 0
    ) {
      setFormValid(false);
      alert('Please ensure all values are greater than zero.');
      return;
    }

    // Prepare the data to send to the API
    const payload = {
      icePrice,
      iceMileage,
      fuelCost,
      evPrice,
      evRange,
      batteryCapacity,
      chargingCost,
      batteryReplacementCost,
      batteryReplacementInterval,
      monthlyKm,
      calculationDuration,
      considerBatteryReplacement,
    };

    try {
      // Make an API call
      const response = await axios.post('https://calculatorserver01.onrender.com/calculate', payload);
      setTcoData(response.data); // Set the TCO data from the response
      setIsLoading(false);
      setFormValid(true); // Set form as valid only after the API call succeeds
    } catch (error) {
      console.error('Error fetching TCO data', error);
    }
  };

  // Example Chart logic (mock data)
  useEffect(() => {
    const ctx = document.getElementById('tcoChart').getContext('2d');

    const tcoChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...Array(16).keys()].slice(1),
        datasets: [
          {
            label: 'ICE TCO',
            data: calculateTCO('ICE'),
            borderColor: 'blue',
            fill: false,
          },
          {
            label: 'EV TCO',
            data: calculateTCO('EV'),
            borderColor: 'red',
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'Years' } },
          y: { title: { display: true, text: 'TCO (Rs. in lakhs)' } },
        },
      },
    });

    return () => tcoChart.destroy();
  }, [icePrice, evPrice, monthlyKm]);

  function calculateTCO(vehicleType) {
    const tcoValues = [];
    for (let year = 1; year <= 15; year++) {
      if (vehicleType === 'ICE') {
        tcoValues.push(icePrice + (year * monthlyKm * 12 * fuelCost) / iceMileage);
      } else {
        const evTCO = evPrice + (year * (monthlyKm * 12 * batteryCapacity) / evRange) * chargingCost;
        if (considerBatteryReplacement && year % batteryReplacementInterval === 0) {
          tcoValues.push(evTCO + batteryReplacementCost);
        } else {
          tcoValues.push(evTCO);
        }
      }
    }
    return tcoValues;
  }

  // Pie chart data
  const pieData = {
    labels: ['ICE Vehicle', 'EV Vehicle'],
    datasets: [
      {
        label: 'Total Cost',
        data: [tcoData?.ice_tco || 0, tcoData?.ev_tco || 0],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'TCO Comparison (Pie Chart)' },
    },
  };

  return (
    <div className="max-w-7xl mx-auto py-10 bg-[rgba(255,253,250,1)] bg-cover bg-center rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold text-center mb-6">Total Cost of Ownership (TCO) Comparison</h2>
    <h1 className="text-center text-4xl font-bold text-white mb-10">ICE Vehicle vs EV Cost Saving</h1>
  
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* ICE Vehicle */}
      <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">ICE Vehicle</h2>
        <div className="mb-3">
          <label className="block text-sm text-gray-600">ICE Price (Rs):</label>
          <input 
            type="number" 
            value={icePrice} 
            onChange={e => setIcePrice(+e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm text-gray-600">ICE Mileage (km/l):</label>
          <input 
            type="number" 
            value={iceMileage} 
            onChange={e => setIceMileage(+e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Fuel Cost (Rs/liter):</label>
          <input 
            type="number" 
            value={fuelCost} 
            onChange={e => setFuelCost(+e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
  
      {/* EV Vehicle */}
      <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">EV Vehicle</h2>
        <div className="mb-3">
          <label className="block text-sm text-gray-600">EV Price (Rs):</label>
          <input 
            type="number" 
            value={evPrice} 
            onChange={e => setEvPrice(+e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm text-gray-600">True Range (Km):</label>
          <input 
            type="number" 
            value={evRange} 
            onChange={e => setEvRange(+e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm text-gray-600">Battery Capacity (kWh):</label>
          <input 
            type="number" 
            value={batteryCapacity} 
            onChange={e => setBatteryCapacity(+e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Charging Cost (Rs/kWh):</label>
          <input 
            type="number" 
            value={chargingCost} 
            onChange={e => setChargingCost(+e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
  
      {/* Customer Usage */}
      <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Customer Usage</h2>
        <div className="mb-3">
          <label className="block text-sm text-gray-600">Monthly Km:</label>
          <input 
            type="number" 
            value={monthlyKm} 
            onChange={e => setMonthlyKm(+e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm text-gray-600">Calculation Duration (Years):</label>
          <input 
            type="number" 
            value={calculationDuration} 
            onChange={e => setCalculationDuration(+e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              checked={considerBatteryReplacement} 
              onChange={e => setConsiderBatteryReplacement(e.target.checked)} 
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Consider Battery Replacement</span>
          </label>
        </div>
      </div>
  
      {/* Chart Section */}
      <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Line Chart */}
          <div className="w-full">
            <canvas id="tcoChart" className="w-full h-96"></canvas> {/* Full width for the line chart */}
          </div>
  
          {/* Pie Chart */}
          <div className="w-full">
            <div className="h-96"> {/* Same height for the pie chart */}
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>
  
    </div>
  
    <div className="flex justify-center mt-8">
        <button 
          onClick={handleClick} 
          className="px-5 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition duration-300 flex items-center justify-center"
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0H4z"></path>
            </svg>
          ) : 'Calculate'}
        </button>
      </div>
  
    {/* Conditional render of the ResultComponent */}
    {formValid && tcoData && <ResultComponent tcoData={tcoData} />}
  </div>
  
  );
}

const ResultComponent = ({ tcoData }) => {
  // Prepare chart data
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
      legend: { position: 'top' },
      title: { display: true, text: 'ICE vs EV - Total Cost of Ownership (TCO)' },
    },
  };

  // PDF Generation function
  const downloadPdf = async () => {
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.style.display = 'none'; // Hide the download button

    const input = document.getElementById('tcoResult');
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, canvas.height * 190 / canvas.width);
    pdf.save('TCO-Comparison.pdf');

    downloadButton.style.display = 'block'; // Show the download button again after saving
  };

  return (
    <div id="tcoResult" className="mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Total Cost of Ownership (TCO) Comparison</h2>
      <div className="flex justify-center">
        {/* Bar chart */}
        <div className="w-full max-w-4xl">
          <Bar data={data} options={options} />
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Breakdown:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ICE Breakdown */}
          <div className="bg-blue-100 p-4 rounded-lg shadow-md">
            <h4 className="text-lg font-bold text-blue-700 mb-3">ICE Vehicle</h4>
            <p className="mb-2">
              <span className="font-semibold">Purchase Price:</span> Rs. {tcoData.breakdown.ice.purchasePrice}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Fuel Cost:</span> Rs. {tcoData.breakdown.ice.fuelCost}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Maintenance Cost:</span> Rs. {tcoData.breakdown.ice.maintenanceCost}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Insurance Cost:</span> Rs. {tcoData.breakdown.ice.insuranceCost}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Resale Value:</span> Rs. {tcoData.breakdown.ice.resaleValue}
            </p>
          </div>

          {/* EV Breakdown */}
          <div className="bg-green-100 p-4 rounded-lg shadow-md">
            <h4 className="text-lg font-bold text-green-700 mb-3">EV Vehicle</h4>
            <p className="mb-2">
              <span className="font-semibold">Purchase Price:</span> Rs. {tcoData.breakdown.ev.purchasePrice}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Charging Cost:</span> Rs. {tcoData.breakdown.ev.chargingCost}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Maintenance Cost:</span> Rs. {tcoData.breakdown.ev.maintenanceCost}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Insurance Cost:</span> Rs. {tcoData.breakdown.ev.insuranceCost}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Battery Replacement Cost:</span> Rs. {tcoData.breakdown.ev.batteryReplacementCost}
            </p>
          </div>
        </div>
      </div>

      {/* PDF Download Button */}
      <div className="text-center mt-6">
        <button
          id="downloadButton"
          onClick={downloadPdf}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default App;
