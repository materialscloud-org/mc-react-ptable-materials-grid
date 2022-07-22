import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';


const compounds_link = "https://dev-www.materialscloud.org/mcloud/api/v2/discover/mc3d/compounds";


function createData(mc3d_id, formula, spacegroup_int, spacegroup_nr, tot_mag, abs_mag) {
  return {
    mc3d_id,
    formula,
    spacegroup_int,
    spacegroup_nr,
    tot_mag,
    abs_mag,
  };
}

// const rows = [
//   createData('mc3d-10/pbe', 'Ge13Ir4Y3', 'Pm-3n', 223, 0, 0),
//   createData('mc3d-10006/pbe', 'AgF7Ru', 'P2_1/c', 14, 11.83, 12.32),
// ];

var rows = [];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'id',
    numeric: false,
    disablePadding: true,
    label: 'MC3D-ID',
  },
  {
    id: 'formula',
    numeric: false,
    disablePadding: true,
    label: 'Formula',
  },
  {
    id: 'spg',
    numeric: false,
    disablePadding: true,
    label: 'Spacegroup int.',
  },
  {
    id: 'spgn',
    numeric: true,
    disablePadding: false,
    label: 'Spacegroup nr.',
  },
  {
    id: 'tm',
    numeric: true,
    disablePadding: false,
    label: 'Total magnetization',
  },
  {
    id: 'am',
    numeric: true,
    disablePadding: false,
    label: 'Abs. magnetization',
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, rowCount, onRequestSort } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align='center'
            padding='normal'
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};


function EnhancedTable(props) {

  // populate rows with compounds
  var compounds = props.compounds;
  rows = [];
  Object.keys(compounds).map((i)=>{
    Object.keys(compounds[i]).map((j)=>{
      var row = {...compounds[i][j], ...{formula: i}};
      if (!('tm' in row)) {
        row['tm'] = NaN;
      }
      if (!('am' in row)) {
        row['am'] = NaN;
      }
      rows.push(row);
    })
  });

  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('id');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size='small'
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {

                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.mc3d_id}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        align="center"
                      >
                        {row.id}
                      </TableCell>
                      <TableCell align="center">{row.formula}</TableCell>
                      <TableCell align="center">{row.spg}</TableCell>
                      <TableCell align="center">{row.spgn}</TableCell>
                      <TableCell align="center">{row.am}</TableCell>
                      <TableCell align="center">{row.tm}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 33 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 50, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}

class MaterialsTable extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      data: [],
    };    
  }

  componentDidMount() {
    fetch(compounds_link, { method: 'get' })
    .then(res => res.json())
    .then(
      r => {
        //console.log(r)
        this.setState({
          isLoaded: true,
          data: r.data.compounds,
        }); 
      });
  };
  
    render(){
      const error = this.state.error;
      let isLoaded = this.state.isLoaded;
      if (error) {
        return <div>Error: {error.message}</div>;
      } else if (!isLoaded) {
        return <div>Loading...</div>;
      } else {
        return (<EnhancedTable compounds={this.state.data}/>);
      }
    };
}

export default MaterialsTable;