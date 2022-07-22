import './App.css';
import PTable from './components/ptable';
import Button from '@mui/material/Button';
import MaterialsTable from './components/materials-table';

import TextField from "@mui/material/TextField";


function App() {
  return (
    <div>
      <PTable />
      {/* <Button variant="contained">Hello World</Button> */}
      <div><label style={{fontWeight:'bold',marginLeft:'0.5em'}}>Search formula or MC3d-ID</label><TextField style={{marginLeft:'0.5em'}} label="Search"/></div>
      <MaterialsTable />
    </div>
  );
}

export default App;