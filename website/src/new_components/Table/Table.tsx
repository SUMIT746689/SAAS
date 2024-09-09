import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export const TableRowWrapper = ({ children, ...params }) => {
  return (
    <TableRow
      {...params}
      sx={{ ':hover': { backgroundColor: '#e2e8f0' } }}
      // sx={{ ":hover": { backgroundColor: "#9bc0ff", } }}
    >
      {/* <Typography noWrap variant="h5" fontWeight={500}> */}
      {children}
      {/* </Typography> */}
    </TableRow>
  );
};

export const TableCellWrapper = ({ children }) => {
  return (
    <TableCell sx={{ border:(theme)=>`1px solid ${theme.palette.primary.light}`}}>
      <Typography noWrap variant="h5" fontWeight={500}>
        {children}
      </Typography>
    </TableCell>
  );
};

export const TableHeaderCellWrapper = ({ children, style = {}, ...params }) => {
  return (
    <TableCell sx={{ border: '1px solid lightgray', p:0.5, fontWeight:600, fontSize: { xs: 11, md: 12, xl: 13 }, ...style }} {...params}>
      {children}
    </TableCell>
  );
};

export const TableBodyCellWrapper = ({ children, ...params }) => {
  return (
    <TableCell sx={{ border: '1px solid lightgray', p:0.5, fontSize: { xs: 11, md: 12, xl: 13 } }} {...params}>
      {children}
    </TableCell>
  );
};

export const TableFooterCellWrapper = ({ children, ...params }) => {
  return (
    <TableCell sx={{ border: '1px solid lightgray', px: 0.6, py: 1, fontSize: { xs: 10, md: 11, xl: 12 },color:"black" }} {...params}>
      {children}
    </TableCell>
  );
};
