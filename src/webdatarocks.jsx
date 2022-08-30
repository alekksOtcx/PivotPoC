import React from 'react17';
import * as WebDataRocksReact from 'react-webdatarocks';

class WebDataRocksPivotTable extends React.Component {
    constructor(props) {
      super(props);
      this.state = props;
    }

    render() {
        return (
            <div>
              <WebDataRocksReact.Pivot 
               toolbar={true}
               componentFolder="https://cdn.webdatarocks.com/"
               width="100%"
               //report="https://cdn.webdatarocks.com/reports/report.json"
               dataSource="../sampleData/RunsSampleData.csv"
              />
            </div>
          );
    }
}

export { WebDataRocksPivotTable }