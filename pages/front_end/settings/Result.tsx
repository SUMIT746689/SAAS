import { Grid, TextField, Typography, Button, Tooltip, IconButton, FormGroup, FormControlLabel, Switch } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import { TableBodyCellWrapper, TableHeaderCellWrapper } from '@/components/Table/Table';
import TableContainer from '@mui/material/TableContainer';
import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

const Result = ({ menuInfo, setEditData, setOpen, handleDeleteMenu, setMenuItemId, setMenuLabel }) => {
  const { t }: { t: any } = useTranslation();
  // isSmallSize
  const [isSmallSize, setIsSmallSize] = useState(false);
  const [isOn, setIsOn] = useState(false);
  useEffect(() => {
    const storedValue = localStorage.getItem('isSmallSize');
    console.log(storedValue);
    if (storedValue !== null) {
      setIsSmallSize(JSON.parse(storedValue));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('isSmallSize', JSON.stringify(isSmallSize));
  }, [isSmallSize]);

  return (
    <Grid component={Paper} sx={{ borderRadius: 0.5 }} mx={1} mt={3}>
      <Grid sx={{ pt: 2, px: 1, pb: 2 }}>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={isSmallSize} onChange={() => setIsSmallSize((value) => !value)} inputProps={{ 'aria-label': 'controlled' }} />}
            label={`Branch: ${isSmallSize ? 'On' : 'Off'}`}
            labelPlacement="start"
            sx={{ mr: 'auto' }}
          />{' '}
        </FormGroup>
      </Grid>
    </Grid>
  );
};

export default Result;
