import React from 'react';
import { Table, Input, Button, Popconfirm, Form, Checkbox, Switch } from 'antd';
import HistoryComponent from './History.component';

const { Search } = Input;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  state = {
    editing: false,
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `${title} is required.`,
            },
          ],
          initialValue: record[dataIndex],
        })(<Input type={dataIndex==='paid' ? 'number' : 'text'} ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />)}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    );
  };

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    const defaultColumns = [
      {
        title: 'Kick',
        dataIndex: 'operation',
        render: (text, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
              <span style={{ color: 'red' }}><b>№{record.key}</b></span>
            </Popconfirm>
          ) : null,
      },
      {
        title: 'Name',
        dataIndex: 'name',
        editable: true,
        ellipsis: true
      },
      {
        title: 'Paid',
        dataIndex: 'paid',
        editable: true,
      },
      {
        title: 'Must',
        dataIndex: 'must',
      },
      {
        title: 'Diff',
        dataIndex: 'diff',
      },
      {
        align: 'center',
        key: 0,
        title: '№0',
        dataIndex: 'checkbox',
        render: (text, record) =>
        this.state.dataSource.length >= 1 ? (
          <Checkbox checked={record.splitters.includes(0)} onChange={() => this.onChangeCheckBox(record.key, 0)}/>
        ) : null,
      },
    ];

    const defaultDataSource = [
      {
        key: 0,
        name: 'name',
        paid: 0,
        must: 0,
        diff: 0,
        splitters: [0]
      },
    ]

    this.state = {
      dataSource: defaultDataSource,
      count: 1,
      columns: defaultColumns,
      totalSumm: 0,
      autoupdate: true
    };
  }

  handleDelete = key => {
    const dataSource = [...this.state.dataSource];
    const columns = [...this.state.columns];

    for(var i = 0; i < dataSource.length; i++) {
      var index = dataSource[i].splitters.indexOf(key);
      if (index > -1) {
        dataSource[i].splitters.splice(index, 1);
      }
    }

    this.setState(
      { 
        dataSource: dataSource.filter(item => item.key !== key) ,
        columns: columns.filter(item => item.key !== key) 
      }, () => {
        if(this.state.autoupdate) {
          this.handleRecalculate();
        }
      }
    );
  };

  onChangeCheckBox = (recordKey, columnKey) => {
    const { dataSource } = this.state;
    for(var i = 0; i < dataSource.length; i++) {
      if(dataSource[i].key === recordKey) {
        if(dataSource[i].splitters.includes(columnKey)) {
          dataSource[i].splitters.splice(dataSource[i].splitters.indexOf(columnKey), 1);
        } else {
          dataSource[i].splitters.push(columnKey);
        }
      }
    }
    this.setState(
      { 
        dataSource: dataSource
      }, () => {
        if(this.state.autoupdate) {
          this.handleRecalculate();
        }
      }
    );
  };

  handleAdd = () => {
    const { count, dataSource, columns } = this.state;
    const newData = {
      key: count,
      name: `name`,
      paid: 0,
      must: 0,
      diff: 0,
      splitters: [count]
    };

    const newColumn = {
      align: 'center',
      key: count,
      title: `№${newData.key}`,
      dataIndex: `checkbox`,
      render: (text, record) =>
      this.state.dataSource.length >= 1 ? (
        <Checkbox checked={record.splitters.includes(count)} onChange={() => this.onChangeCheckBox(record.key, count)}/>
      ) : null,
    }
    this.setState({
      dataSource: [...dataSource, newData],
      columns: [...columns, newColumn],
      count: count + 1,
    });
  };

  handleRecalculate = () => {
    const { dataSource } = this.state;
    var totalSumm = 0;
    for(var i = 0; i< dataSource.length; i++) {
      totalSumm += parseInt(dataSource[i].paid);
      dataSource[i].must = 0;
      dataSource[i].diff = 0;
    }


    for(var l = 0; l < dataSource.length; l++) {
      var count = dataSource[l].splitters.length;
      var sumPerUnit = parseInt(dataSource[l].paid)/count
      for(var j = 0; j < dataSource[l].splitters.length; j++) {
        dataSource.filter(item => item.key === dataSource[l].splitters[j])[0].must += sumPerUnit;
      }
    }

    for(var k = 0; k < dataSource.length; k++) {
      dataSource[k].diff = dataSource[k].paid - dataSource[k].must;
    }

    this.setState({
      totalSumm: totalSumm,
      dataSource: dataSource
    });
  }

  handleSave = row => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData }, () => {
      if(this.state.autoupdate) {
        this.handleRecalculate();
      }
    });
  };

  onChangeAutoUpdate = checked => {
    this.setState({
      autoupdate: checked
    });
  }

  saveCurrentResult = val => {
    var { dataSource, columns } = this.state;
    var json = {
      name: val,
      date: new Date().toISOString(),
      dataSource: dataSource,
      columns: columns
    }
    var id = 'splitter-' + new Date().getTime();
    localStorage.setItem(id, JSON.stringify(json));
  }

  loadTableFromHistory = table => {
    this.setState({
      dataSource: table.dataSource,
      count: Math.max( ...table.dataSource.map(e => e.key)) + 1,
      columns: table.columns,
      totalSumm: 0,
      autoupdate: true
    });
  }
  
  render() {
    var { dataSource, totalSumm} = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    for(var k = 0; k < dataSource.length; k++) {
      dataSource[k].must = (parseInt(dataSource[k].must * 100)/100);
      dataSource[k].diff = (parseInt(dataSource[k].diff * 100)/100);
    }
    const columns = this.state.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div className="splitter">
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
        <div style={{ marginTop: 16 }}>
          <Button onClick={this.handleAdd} type="primary">
            Add a row
          </Button>
          {!this.state.autoupdate && 
          <Button onClick={this.handleRecalculate} type="primary" style={{marginLeft: 16. }}>
            Recalculate
          </Button>}
          <span style={{ marginLeft: 16. }}>TOTAL: {totalSumm}</span>
          <span> , (middle bill {dataSource.length && (totalSumm/dataSource.length).toFixed(2)})  </span>
          <span> Autorecalculation </span>
          <Switch checked={this.state.autoupdate} onChange={this.onChangeAutoUpdate} ></Switch>
        </div>
        <div>
        <Search
            placeholder="Title for Save"
            enterButton="Save"
            size="large"
            onSearch={(value) => this.saveCurrentResult(value) }
          />
        </div>
        <HistoryComponent 
          loadTableFromHistory={this.loadTableFromHistory} 
          onChangeCheckBox={this.onChangeCheckBox}
          onDeleteRaw={this.handleDelete}
        ></HistoryComponent>
      </div>
    );
  }
}

export default EditableTable;
