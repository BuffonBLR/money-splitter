import React, { Component } from "react";
import { List } from "antd";


class HistoryComponent extends Component {

  constructor(props) {
    super(props);
    const storage = {...localStorage};
    const keys = Object.keys(storage);
    const data = [];
    for (var i = 0; i< keys.length; i++) {
      if(keys[i].indexOf("splitter") === 0){
        var json = JSON.parse(storage[keys[i]]);
        var element = {
          key: keys[i],
          title: json.name + ' ' + json.date, 
          users: json.dataSource.map((el) => { return el.name}).join(', ')
        }
        data.push(element);
      }
    }
    this.state = {
      data: data
    }
  }

  render() {
    return (
      <List
        itemLayout="horizontal"
        dataSource={this.state.data}
        renderItem={item => (
          <List.Item 
            actions={[<button onClick={() => this.props.loadTableFromHistory(item.key)}>load</button>]}
          >
            <List.Item.Meta
              title={item.title}
              description={item.users}
            />
          </List.Item>
        )}
      />
    );
  }
}

export default HistoryComponent;
