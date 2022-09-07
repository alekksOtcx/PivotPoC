export function getReport(data){
    return {
      "dataSource": {
        "dataSourceType": "json",
        "data": data
    },
          "slice": {
              "expands": {
      "expandAll": true
              },
          "rows": [
              {
                  "uniqueName": "Currency"
              },
              {
                  "uniqueName": "Bank"
              },
              {
                  "uniqueName": "Tenor"
              },
              {
                  "uniqueName": "Offer"
              },
              {
                  "uniqueName": "Bid Size - DV01"
              },
              {
                  "uniqueName": "Offer Size - DV01"
              },
              {
                  "uniqueName": "Last Updated"
              }
          ],
          "columns": [
              {
                  "uniqueName": "Measures"
              }
          ],
          "measures": [
              {
                  "uniqueName": "Bid",
                  "aggregation": "sum"
              }
          ],
          "flatOrder": [
              "Currency",
              "Bank",
              "Tenor",
              "Bid",
              "Offer",
              "Bid Size - DV01",
              "Offer Size - DV01",
              "Last Updated"
          ],
          "sorting": {
      "column": {
          "type": "asc",
          "tuple": [],
          "measure": "Currency"
      }
  }
      },
      "options": {
          "grid": {
              "type": "flat",
              "title": "",
              "showFilter": true,
              "showHeaders": true,
              "showTotals": false,
              "showGrandTotals": "off",
              "showHierarchies": true,
              "showHierarchyCaptions": true,
              "showReportFiltersArea": true
          },
          "configuratorActive": false,
          "configuratorButton": true,
          "showAggregations": true,
          "showCalculatedValuesButton": true,
          "drillThrough": true,
          "showDrillThroughConfigurator": true,
          "sorting": "on",
          "datePattern": "dd/MM/yyyy",
          "dateTimePattern": "dd/MM/yyyy HH:mm:ss",
          "saveAllFormats": false,
          "showDefaultSlice": true,
          "defaultHierarchySortName": "asc"
      },
      "conditions": [
          {
              "formula": "#value < 1.137",
              "measure": "Bid",
              "format": {
                  "backgroundColor": "#4FC3F7",
                  "color": "#000000",
                  "fontFamily": "Arial",
                  "fontSize": "12px"
              }
          }
      ],
      "formats": [
          {
              "name": "",
              "thousandsSeparator": " ",
              "decimalSeparator": ".",
              "decimalPlaces": 6,
              "maxSymbols": 20,
              "currencySymbol": "",
              "currencySymbolAlign": "left",
              "nullValue": " ",
              "infinityValue": "Infinity",
              "divideByZeroValue": "Infinity"
          }
      ]
  }
  }

  export function mergeReportAndData(report, data){
    report.dataSource = {dataSourceType:"json", data:data};
    return report;
  }