import React, { Component } from "react";
import { List, Popconfirm, Checkbox, Button } from "antd";

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

  loadTable = key => {
    var table = JSON.parse(localStorage.getItem(key));
    var totalSumm = 0;
    const { dataSource } = table;

    for(var i = 0; i< dataSource.length; i++) {
      totalSumm += parseInt(dataSource[i].paid);
    }

    for(var i = 0; i < table.columns.length; i++) {
      if(table.columns[i].dataIndex === 'operation') {
        table.columns[i].render = (text, record) => {
          return (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.props.onDeleteRaw(record.key)}>
              <span style={{ color: 'red' }}><b>№{record.key}</b></span>
            </Popconfirm>
          )
        }
      } 
      if (table.columns[i].dataIndex === 'checkbox') {
        let columnKey = table.columns[i].key;
        table.columns[i].render = (text, record) => {
          return (
            <Checkbox checked={record.splitters.includes(columnKey)} onChange={() => this.props.onChangeCheckBox(record.key, columnKey)}/>
          )
        }
      }
    }
    table.totalSumm = totalSumm;
    this.props.loadTableFromHistory(table)
  }

  render() {
    return (
      <List
        itemLayout="horizontal"
        dataSource={this.state.data}
        renderItem={item => (
          <List.Item 
            actions={[<Button type="primary" onClick={() => this.loadTable(item.key)}>Load</Button>]}
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
