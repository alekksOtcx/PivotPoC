export function getReport(data){
    return {
      "dataSource": {
        "dataSourceType": "json",
        "data": data
    },
    "slice": {
        "rows": [
            {
                "uniqueName": "Currency",
                "sort": "unsorted"
            },
            {
                "uniqueName": "Tenor",
                "sort": "unsorted"
            },
            {
                "uniqueName": "Instrument Type"
            },
            {
                "uniqueName": "Bank",
                "sort": "unsorted"
            },
            {
                "uniqueName": "Last Updated",
                "sort": "unsorted"
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
            },
            {
                "uniqueName": "Offer",
                "aggregation": "sum"
            },
            {
                "uniqueName": "Bid Size - DV01",
                "aggregation": "sum",
                "format": "55mnkvng"
            },
            {
                "uniqueName": "Offer Size - DV01",
                "aggregation": "sum",
                "format": "55mnl2gn"
            }
        ],
        "expands": {
            "expandAll": true
        },
        "flatOrder": [
            "Currency",
            "Bank",
            "Bid",
            "Offer",
            "Bid Size - DV01",
            "Offer Size - DV01",
            "Last Updated",
            "Tenor"
        ]
    },
    "options": {
        "grid": {
            "type": "classic",
            "showTotals": "off",
            "showGrandTotals": "off"
        }
    },
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
        },
        {
            "name": "55mnkvng",
            "thousandsSeparator": " ",
            "decimalSeparator": ".",
            "decimalPlaces": 0,
            "currencySymbol": "",
            "currencySymbolAlign": "left",
            "nullValue": " ",
            "textAlign": "right",
            "isPercent": false
        },
        {
            "name": "55mnl2gn",
            "thousandsSeparator": " ",
            "decimalSeparator": ".",
            "decimalPlaces": 0,
            "currencySymbol": "",
            "currencySymbolAlign": "left",
            "nullValue": " ",
            "textAlign": "right",
            "isPercent": false
        }
    ]
}
  }

  export function mergeReportAndData(report, data){
    report.dataSource = {dataSourceType:"json", data:data};
    return report;
  }