import React, { Component } from "react";
import EditableTable from './Table.component'

class MainComponent extends Component {

  constructor() {
    super();
    this.state = {
      tableSize: null,
      dataSource: null,
      columns: null
    }
  }

  render() {
    return (
      <div>
        <EditableTable></EditableTable>
      </div>
    );
  }
}

export default MainComponent;