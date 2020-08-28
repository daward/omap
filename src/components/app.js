import React from 'react';
import '../app.css';
import { Table } from "semantic-ui-react";
import ElevationCanvas from "../containers/elevationcanvas";
import DetailView from '../containers/detailview';
import ViewController from '../containers/viewcontroller';

function App() {
  return (
    <div>
      <Table>
        <Table.Row verticalAlign="top">
          <Table.Cell width={1}>
            <ElevationCanvas size={600} type="master" />
          </Table.Cell>
          <Table.Cell width={1}>
            <ElevationCanvas radius={40} size={600} type="zoom" />
          </Table.Cell>
        </Table.Row>
      </Table>
      <DetailView />
      <ViewController/>
    </div>
  );
};

export default App;
