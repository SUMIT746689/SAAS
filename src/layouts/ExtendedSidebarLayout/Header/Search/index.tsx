import {
  Fragment,
  forwardRef,
  Ref,
  useState,
  ReactElement,
  ChangeEvent,
  useEffect
} from 'react';
import {
  Box,
  Divider,
  IconButton,
  List,
  CircularProgress,
  ListItem,
  Grid,
  InputBase,
  Tooltip,
  Typography,
  Card,
  Dialog,
  alpha,
  Slide,
  styled,
  useTheme,
  Alert
} from '@mui/material';
import Link from 'src/components/Link';

import { TransitionProps } from '@mui/material/transitions';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import { useTranslation } from 'react-i18next';
import Scrollbar from 'src/components/Scrollbar';
import KeyboardArrowRightTwoToneIcon from '@mui/icons-material/KeyboardArrowRightTwoTone';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';

const wait = (time: number): Promise<void> =>
  new Promise((res) => setTimeout(res, time));

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const DialogWrapper = styled(Dialog)(
  () => `
    .MuiDialog-container {
        height: auto;
    }
    
    .MuiDialog-paperScrollPaper {
        max-height: calc(100vh - 64px)
    }
`
);

const SearchInputWrapper = styled(InputBase)(
  ({ theme }) => `
    font-size: ${theme.typography.pxToRem(18)};
    padding: ${theme.spacing(2)};
    width: 100%;
`
);

const IconButtonWrapper = styled(IconButton)(
  ({ theme }) => `
        width: ${theme.spacing(4)};
        height: ${theme.spacing(4)};
        border-radius: ${theme.general.borderRadiusLg};
`
);

const ListButton = styled(Box)(
  ({ theme }) => `
      background-color: transparent;
      color:  ${theme.colors.alpha.black[100]};
      transition: ${theme.transitions.create(['all'])};
      border: ${theme.colors.alpha.black[10]} solid 1px;
      border-radius: ${theme.general.borderRadius};
      padding: ${theme.spacing(1)};
      margin: ${theme.spacing(1, 0)};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;

      & > div > .MuiSvgIcon-root {
        color:  ${theme.colors.alpha.black[50]};
        transition: ${theme.transitions.create(['all'])};
      }

      &:hover {
        background-color: ${alpha(theme.colors.primary.main, 0.08)};
        color:  ${theme.colors.primary.main};
        border-color: ${alpha(theme.colors.primary.main, 0.3)};

        & > div > .MuiSvgIcon-root {
          color:  ${theme.colors.primary.main};
        }
      }
`
);

function HeaderSearch() {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();

  const [searchValue, setSearchValue] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { showNotification } = useNotistick();

  const handleSearchChange = (event: ChangeEvent<{ value: unknown }>) => {
    setSearchValue(event.target.value as string);
  };

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFetch = async () => {
    try {
      if (!searchValue || searchValue.length < 3) return setSearchResults([]);
      setSearchLoading(true);
      const { data } = await axios.get(
        `/api/student/search-students?search_value=${searchValue}`
      );
      setSearchResults(data);
    } catch (err) {
      setSearchResults([]);
      handleShowErrMsg(err, showNotification);
      console.log({ err });
    } finally {
      // setTimeout(() =>
      setSearchLoading(false);
      // , 5000)
    }
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      handleFetch();
      // handleDebounce(value);
      // handleSearchChange(searchValue)
    }, 500);

    return () => clearTimeout(getData);
  }, [searchValue]);

  return (
    <>
      <Tooltip arrow title={t('Search Student')}>
        <IconButtonWrapper onClick={handleClickOpen}>
          <SearchTwoToneIcon
            sx={{
              width: '36px',
              height: '36px',
              fontSize: 38,
              color: 'white',
              p: 0.25,
              ':hover': { border: '2px solid white', borderRadius: 0.5 }
            }}
            fontSize="small"
          />
        </IconButtonWrapper>
      </Tooltip>

      <DialogWrapper
        open={open}
        TransitionComponent={Transition}
        keepMounted
        maxWidth="sm"
        fullWidth
        scroll="paper"
        onClose={handleClose}
      >
        <Box>
          <form
          // onSubmit={submitSearch}
          >
            <Box display="flex" alignItems="center">
              <Box flexGrow={1} display="flex" alignItems="center">
                <SearchTwoToneIcon
                  sx={{
                    ml: 2,
                    color: theme.colors.secondary.main
                  }}
                />
                <SearchInputWrapper
                  value={searchValue}
                  onChange={handleSearchChange}
                  autoFocus
                  placeholder={t('Search terms here...')}
                  fullWidth
                />
              </Box>
              <Card
                sx={{
                  ml: 'auto',
                  mr: 2,
                  py: 0.5,
                  px: 1,
                  background: theme.colors.alpha.black[10]
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  esc
                </Typography>
              </Card>
            </Box>
          </form>
        </Box>
        <Divider />
        {/* {!searchLoading && (
          <>
            {searchResults.length === 0 && (
              <Typography
                variant="subtitle1"
                component="div"
                sx={{
                  background: theme.colors.info.lighter,
                  color: theme.colors.info.main,
                  borderRadius: theme.general.borderRadius,
                  fontSize: theme.typography.pxToRem(13),
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  mx: 2,
                  my: 2
                }}
              >
                <ContactSupportTwoToneIcon
                  sx={{
                    mr: 0.8,
                    fontSize: theme.typography.pxToRem(18)
                  }}
                />
                {t('Start typing to see the search results...')}
              </Typography>
            )}
          </>
        )} */}
        {searchValue.length < 3 && (
          <Alert severity="warning" sx={{ mx: 2, mt: 1 }}>
            Minimum 3 character required...
          </Alert>
        )}
        {searchLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 5,
              height: 450
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                height: 450,
                px: 1
              }}
            >
              <Scrollbar>
                {searchResults?.map((result) => (
                  <Link
                    href={`/students/${result?.student_table_id}`}
                    key={result.id}
                    style={{ textDecoration: 'none' }}
                    onClick={handleClose}
                  >
                    <ListButton>
                      <Box display="flex" alignItems="flex-start">
                        <Typography>
                          {result.first_name} {result?.middle_name || ''}{' '}
                          {result?.last_name} | class: {result?.class_name} |
                          section: {result?.section_name} | roll:{' '}
                          {result?.class_roll_no}
                        </Typography>
                      </Box>
                      <KeyboardArrowRightTwoToneIcon fontSize="small" />
                    </ListButton>
                  </Link>
                ))}
              </Scrollbar>
            </Box>
          </>
        )}
      </DialogWrapper>
    </>
  );
}

export default HeaderSearch;
