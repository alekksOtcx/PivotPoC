import React from 'react';
import { ReactPivotTable } from './react-pivottable.jsx';
import { WebDataRocksPivotTable } from './webdatarocks.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = props;
  }

  render() {
    return (
      <div>
        {/* <div>
          <ReactPivotTable />
        </div> */}
        <div>
          <WebDataRocksPivotTable />
        </div>
      </div>
    );
  }
}

export default App;
