import React from 'react';
import * as Papa from 'papaparse'
import * as WebDataRocksReact from 'react-webdatarocks';
import * as pivotCss from './pivot.css';
import { getRunsData } from './dataProvider.js'
import { getReport, mergeReportAndData } from './reportProvider.js'
import Chart from 'chart.js/auto';
import Cookies from 'universal-cookie';


const REPORT = "http://localhost:8080/report.json";

async function fetchSampleData() {
  const processedData =  Papa.parse(await fetchCsv());
  return processedData;
}

async function fetchCsv() {
  const response = await fetch('../sampleData/RunsSampleData.csv');
  const reader = response.body.getReader();
  const result = await reader.read();
  const decoder = new TextDecoder('utf-8');
  const csv = await decoder.decode(result.value);
  return csv;
}
class WebDataRocksPivotTable extends React.Component {
  chartRef = React.createRef();
  myRef = null;

  constructor(props) {
    super(props);
    this.myRef = React.createRef();

    this.customizeCellFunction = this.customizeCellFunction.bind(this);
    this.createCharts = this.createCharts.bind(this);
    this.drawChart = this.drawChart.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.saveReport = this.saveReport.bind(this);
    this.loadReport = this.loadReport.bind(this);
    this.customizeToolbar = this.customizeToolbar.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this);
  }

  componentDidMount() {
    var data = getRunsData();
    var maxBids = [];
    var minOffers = [];
    var maxBid = parseFloat(data[1].Bid);
    var minOffer = parseFloat(data[1].Offer);
    var maxBidId = data[1].Id;
    var minOfferId = data[1].Id;
    for (var i = 2; i < data.length - 1; i++) {
      //assume data sorted by incremental Id
      if (data[i].Id == maxBidId) {
        maxBid = Math.max(parseFloat(data[i].Bid), maxBid);
        if(maxBids.find((x) => x.key == maxBidId) != null){
          maxBids.find((x) => x.key == maxBidId).value = maxBid;
        } else {
        maxBids.push({ key: maxBidId, value: maxBid });
        }
      } else {
        maxBid = parseFloat(data[i].Bid);
        maxBidId = data[i].Id;
      }

      if (data[i].Id == minOfferId) {
        minOffer = Math.min(parseFloat(data[i].Offer), minOffer);
        if(minOffers.find((x) => x.key == minOfferId) != null){
          minOffers.find((x) => x.key == minOfferId).value = minOffer;
        } else {
        minOffers.push({ key: minOfferId, value: minOffer });
        }
      } else {
        minOffer = parseFloat(data[i].Offer);
        minOfferId = data[i].Id;
      }
    }
    this.setState({ maxBids: maxBids, minOffers: minOffers });
  }

  prepareDataFunction(rawData) {
    var result = {};
    var labels = [];
    var data = [];
    for (var i = 0; i < rawData.data.length / 2; i++) {
      // duplicate data bug, unknown why this is happening
      var record = rawData.data[i];
      if (record.c0 == undefined && record.r0 !== undefined) {
        var _record = record.r0;
        labels.push(_record);
      }
      if ((record.c0 == undefined) & (record.r0 == undefined)) continue;
      if (record.v0 != undefined) {
        data.push(!isNaN(record.v0) ? record.v0 : null);
      }
    }
    result.labels = labels;
    result.data = data;
    return result;
  }

  drawChart(rawData) {
    var data = this.prepareDataFunction(rawData);
    var data_for_charts = {
      datasets: [
        {
          data: data.data,
          backgroundColor: [
            "#FF6384",
            "#4BC0C0",
            "#FFCE56",
            "#E7E9ED",
            "#36A2EB",
            "#9ccc65",
            "#b3e5fc",
          ],
        },
      ],
      labels: data.labels,
    };
    var options = {
      responsive: true,
      legend: {
        position: "right",
      },
      title: {
        display: true,
        fontSize: 18,
        text: "Profit by Countries",
      },
      scale: {
        ticks: {
          beginAtZero: true,
        },
        reverse: false,
      },
      animation: {
        animateRotate: false,
        animateScale: true,
      },
    };
    var ctx = document.getElementById("chart").getContext("2d");
    window.chart = new Chart(ctx, {
      data: data_for_charts,
      type: "polarArea",
      options: options,
    });
  }

  updateChart(rawData) {
    chart.destroy();
    this.drawChart(rawData);
  }

  createCharts() {
    this.myRef.webdatarocks.getData({}, this.drawChart, this.updateChart);
  }

  customizeCellFunction(cellBuilder, cellData) {
    //horrible hack
    if (cellData.label == "Total Sum of Bid") {
      cellBuilder.text = cellBuilder.text.slice(13);
    }
    if (cellData.label == "Total Sum of Offer") {
      cellBuilder.text = cellBuilder.text.slice(13);
    }
    if (cellData.label == "Total Sum of Bid Size - DV01") {
      cellBuilder.text = cellBuilder.text.slice(13);
    }
    if (cellData.label == "Total Sum of Offer Size - DV01") {
      cellBuilder.text = cellBuilder.text.slice(13);
    }
    if (!this.state) return null;

    if (cellData.type == "value" && cellData.measure && cellData.measure.name == "Offer") {
      var id = cellData.rows.find(
        (row) => row.hierarchyCaption == "Id"
      ).caption;
      var minOffer = this.state.minOffers.find((x) => x.key == id).value;
      if (minOffer - parseFloat(cellData.label) >= -0.0000001) {
        cellBuilder.addClass("minOffer");
      }
    } else if (cellData.type == "value" && cellData.measure && cellData.measure.name == "Bid") {
      var id = cellData.rows.find(
        (row) => row.hierarchyCaption == "Id"
      ).caption;
      var maxBid = this.state.maxBids.find((x) => x.key == id).value;
      if (maxBid - parseFloat(cellData.label) <= 0.0000001) {
        cellBuilder.addClass("maxBid");
      }
    }
  }

  customizeToolbar(toolbar) {
    var tabs = toolbar.getTabs();
    toolbar.getTabs = function () {
      tabs = tabs.splice(1);
      tabs.splice(1, 1);
      tabs.unshift({
        id: "wdr-tab-lightblue",
        title: "Save",
        handler: handleSaveReport,
        icon: this.icons.save,
      });
      return tabs;
    };
    var handleSaveReport = () => {
      this.saveReport();
    };
  }

  saveReport() {
    var report = this.myRef.webdatarocks.getReport();
    delete report.dataSource;
    const cookies = new Cookies();
    cookies.set("report", report, { path: "/" });
  }

  loadReport() {
    const cookies = new Cookies();
    var savedReport = cookies.get("report");
    if (savedReport != null) {
      return mergeReportAndData(savedReport, getRunsData());
    }
    return getReport(getRunsData());
  }

  handleCellClick(cell) {
    var row = cell.rowIndex;
    var column = cell.columnIndex;
    var length = this.myRef.webdatarocks.getRows().length;
    var selectedData = [{ name: cell.measure.uniqueName, value: cell.label }];
    for (var i = 0; i < length; i++) {
      if (i != column) {
        var otherCell = this.myRef.webdatarocks.getCell(row, i);
        if (otherCell.type == "header") {
          selectedData.push({
            name: otherCell.member.hierarchyName,
            value: otherCell.member.caption,
          });
        } else {
          selectedData.push({
            name: otherCell.measure.uniqueName,
            value: otherCell.label,
          });
        }
      }
    }
    var label = "";
    for (var i = 0; i < selectedData.length; i++) {
      label =
        label +
        " " +
        selectedData[i].name +
        ": " +
        selectedData[i].value +
        "\n";
    }
    alert(label);
  }

  render() {
    var data = this.loadReport();
    return (
      <div>
        <div>
          <WebDataRocksReact.Pivot
            ref={(elem) => {
              this.myRef = elem;
            }}
            toolbar={true}
            componentFolder="https://cdn.webdatarocks.com/"
            width="100%"
            customizeCell={this.customizeCellFunction}
            report={data}
            beforetoolbarcreated={this.customizeToolbar}
            cellclick={this.handleCellClick}
            //reportcomplete={() => {this.createCharts();}}
          />
        </div>
        <canvas id="chart" width="800" height="500"></canvas>
      </div>
    );
  }
}

export { WebDataRocksPivotTable }