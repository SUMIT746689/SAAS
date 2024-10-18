import { customBorder } from '@/utils/mui_style';
import { Autocomplete, Grid, TextField } from '@mui/material';
import { useEffect } from 'react';

export const AutoCompleteWrapper = ({ minWidth = null, required = false, options, value, handleChange, label, placeholder, ...params }) => {
  return (
    <Grid
      item
      pb={1}
      sx={
        minWidth && {
          minWidth
        }
      }
    >
      <Autocomplete
        fullWidth
        {...params}
        size="small"
        sx={customBorder}
        id="tags-outlined"
        options={options}
        value={value}
        filterSelectedOptions        // @ts-ignore

        // @ts-ignore
        renderInput={(rnParams) => <TextField size="small" fullWidth required={required} {...rnParams} label={label} placeholder={placeholder} />}
        onChange={handleChange}
      />
    </Grid>
  );
};

export const AutoCompleteWrapperWithoutRenderInput = ({
  minWidth = null,
  required = false,
  options,
  value,
  handleChange,
  label,
  name,
  error,
  touched,
  placeholder,
  ...params
}) => {
  return (
    <Grid
      item
      pb={1}
      sx={
        minWidth && {
          minWidth
        }
      }
    >
      <Autocomplete
        fullWidth
        {...params}
        size="small"
        sx={customBorder}
        id="tags-outlined"
        options={options}
        value={value}
        filterSelectedOptions
        renderInput={(rnParams) => (
          // @ts-ignore
          <TextField
            // @ts-ignore
            size="small"
            // @ts-ignore
            fullWidth
            required={required}
            {...rnParams}
            name={name}
            error={Boolean(error && touched)}
            helperText={touched && error}
            label={label}
            placeholder={placeholder}
          />
        )}
        onChange={handleChange}
      />
    </Grid>
  );
};

export const EmptyAutoCompleteWrapper = ({ minWidth = null, options, value, label, placeholder, ...params }) => {
  return (
    <Grid
      item
      pb={1}
      sx={
        minWidth && {
          minWidth
        }
      }
    >
      <Autocomplete
        fullWidth
        {...params}
        size="small"
        sx={customBorder}
        id="tags-outlined"
        options={options}
        value={value}
        filterSelectedOptions
        // @ts-ignore
        renderInput={(params) => <TextField size="small" fullWidth {...params} label={label} placeholder={placeholder} />}
      />
    </Grid>
  );
};

export const AutoCompleteWrapperWithDebounce = ({
  debounceTimeout,
  handleDebounce = (value) => { },
  searchHandleUpdate = () => { },
  minWidth = null,
  required = false,
  options,
  value,
  handleChange,
  label,
  placeholder,
  ...params
}) => {
  useEffect(() => {
    const getData = setTimeout(() => {
      handleDebounce(value);
    }, debounceTimeout);

    return () => clearTimeout(getData);
  }, [value]);

  const WarningMessage = (value && (value.length < 3 ? 'Minimum 2 character required' : '')) || 'No options available';

  return (
    <Grid
      item
      pb={1}
      sx={
        minWidth && {
          minWidth
        }
      }
    >
      <Autocomplete
        fullWidth
        {...params}
        size="small"
        sx={customBorder}
        id="tags-outlined"
        options={options}
        value={value}
        filterSelectedOptions
        // @ts-ignore
        renderInput={(rnParams) => <TextField size="small" fullWidth required={required} {...rnParams} label={label} placeholder={placeholder} />}
        onInputChange={handleChange}
        onChange={searchHandleUpdate}
        noOptionsText={WarningMessage}
      />
    </Grid>
  );
};
