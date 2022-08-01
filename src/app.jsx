import React from 'react';
import { ReactPivotTable } from './react-pivottable.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = props;
  }

  render() {
    return (
      <div>
        <ReactPivotTable />
      </div>
    );
  }
}

export default App;
