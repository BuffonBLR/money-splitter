import React, { Component } from "react";
import { Input } from 'antd';
const { Search } = Input;

class SaveTableComponent extends Component {

  constructor(props) {
    super(props);
  }

  saveCurrentResult = val => {
    var { dataSource, columns } = this.props;
    var json = {
      name: val,
      date: new Date().toISOString(),
      dataSource: dataSource,
      columns: columns
    }
    var id = 'splitter-' + new Date().getTime();
    localStorage.setItem(id, JSON.stringify(json));
  }

  render() {
    return (
      <Search
        placeholder="Title for Save"
        enterButton="Save"
        size="large"
        onSearch={(value) => this.saveCurrentResult(value) }
      />
    );
  }
}

export default SaveTableComponent;
