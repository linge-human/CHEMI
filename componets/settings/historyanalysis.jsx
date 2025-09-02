import React, { useState } from "react";
import { BarChart3, Download, Calendar, TrendingUp, FileText, Table } from "lucide-react";

// Mock data for demonstration - in real app this would come from user's calculation history
const mockData = {
  totalCalculations: 247,
  weeklyAverage: 15,
  mostUsedCalculations: [
    { name: "Molar Mass", count: 45, percentage: 18.2 },
    { name: "Molarity", count: 38, percentage: 15.4 },
    { name: "pH Calculation", count: 31, percentage: 12.6 },
    { name: "Gas Laws", count: 28, percentage: 11.3 },
    { name: "Percent Composition", count: 22, percentage: 8.9 },
    { name: "Mass Calculation", count: 19, percentage: 7.7 },
    { name: "Dilution", count: 16, percentage: 6.5 },
    { name: "Temperature Conversion", count: 12, percentage: 4.9 }
  ],
  mostLookedUpElements: [
    { symbol: "H", name: "Hydrogen", lookups: 67 },
    { symbol: "O", name: "Oxygen", lookups: 54 },
    { symbol: "C", name: "Carbon", lookups: 43 },
    { symbol: "Na", name: "Sodium", lookups: 38 },
    { symbol: "Cl", name: "Chlorine", lookups: 35 },
    { symbol: "Fe", name: "Iron", lookups: 29 },
    { symbol: "Ca", name: "Calcium", lookups: 26 },
    { symbol: "N", name: "Nitrogen", lookups: 24 }
  ],
  recentActivity: [
    { date: "2024-01-15", calculations: 12 },
    { date: "2024-01-14", calculations: 8 },
    { date: "2024-01-13", calculations: 15 },
    { date: "2024-01-12", calculations: 6 },
    { date: "2024-01-11", calculations: 11 }
  ]
};

export default function HistoryAnalysis() {
  const [timeRange, setTimeRange] = useState("month");
  const [exportFormat, setExportFormat] = useState("pdf");

  const exportReport = () => {
    const reportData = {
      exportDate: new Date().toISOString(),
      timeRange: timeRange,
      format: exportFormat,
      summary: {
        totalCalculations: mockData.totalCalculations,
        weeklyAverage: mockData.weeklyAverage,
        mostUsedCalculations: mockData.mostUsedCalculations.slice(0, 5),
        mostLookedUpElements: mockData.mostLookedUpElements.slice(0, 5)
      },
      recommendations: [
        "Continue practicing molar mass calculations - you're doing great!",
        "Consider reviewing dilution calculations for better understanding",
        "Hydrogen and oxygen are your most looked-up elements - very common in chemistry"
      ]
    };
    
    if (exportFormat === "pdf") {
      // Mock PDF export
      console.log("Generating PDF report:", reportData);
      alert("PDF report generated successfully! (Mock functionality)\n\nReport includes:\n• Calculation statistics\n• Most used calculations\n• Element lookup history\n• Progress recommendations");
    } else {
      // Mock Excel export
      console.log("Generating Excel report:", reportData);
      alert("Excel report generated successfully! (Mock functionality)\n\nSpreadsheet includes:\n• Raw calculation data\n• Usage statistics\n• Element lookup counts\n• Time-series data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">History & Analysis</h2>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-900 outline-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-900 outline-none"
          >
            <option value="pdf">PDF Report</option>
            <option value="excel">Excel Spreadsheet</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {exportFormat === "pdf" ? <FileText className="w-4 h-4" /> : <Table className="w-4 h-4" />}
            Export {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Total Calculations</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{mockData.totalCalculations}</div>
          <p className="text-gray-600 text-sm">This month</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-900">Weekly Average</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{mockData.weeklyAverage}</div>
          <p className="text-gray-600 text-sm">Calculations per week</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-900">Improvement</span>
          </div>
          <div className="text-3xl font-bold text-green-600">+12%</div>
          <p className="text-gray-600 text-sm">From last month</p>
        </div>
      </div>

      {/* Most Used Calculations */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Most Used Calculations</h3>
        <div className="space-y-3">
          {mockData.mostUsedCalculations.map((calc, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">{calc.name}</span>
                  <span className="text-gray-600">{calc.count} times</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calc.percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-gray-500 text-sm">{calc.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Most Looked Up Elements */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Most Looked Up Elements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockData.mostLookedUpElements.map((element, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                {element.symbol}
              </div>
              <div>
                <div className="font-medium text-gray-900">{element.name}</div>
                <div className="text-sm text-gray-600">{element.lookups} lookups</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Strengths</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Strong performance in molar mass calculations (18.2% of all calculations)</li>
              <li>• Consistent daily usage showing good study habits</li>
              <li>• Good balance between different calculation types</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Study Suggestions</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Consider practicing more advanced stoichiometry problems</li>
              <li>• Review dilution calculations - room for improvement</li>
              <li>• Hydrogen and oxygen are your go-to elements - expand to transition metals</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">Progress Tracking</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• You've improved 12% in calculation speed this month</li>
              <li>• Average 15 calculations per week - excellent consistency!</li>
              <li>• Most active on weekdays - good study schedule</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
