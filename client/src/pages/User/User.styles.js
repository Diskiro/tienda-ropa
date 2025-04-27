import { styled } from '@mui/material/styles';
import {
    Container,
    Grid,
    Paper,
    Avatar,
    Box,
    Divider,
    Button,
    ListItem,
    Typography,
    Tabs
} from '@mui/material';

export const StyledContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

export const StyledGrid = styled(Grid)(({ theme }) => ({
    '&.MuiGrid-root.MuiGrid-container.MuiGrid-direction-xs-row.MuiGrid-spacing-xs-4': {

        
        
    },
    [theme.breakpoints.up('md')]: {
        '&.MuiGrid-root.MuiGrid-container.MuiGrid-direction-xs-row.MuiGrid-spacing-xs-4': {
            justifyContent: 'center',
            display: 'flex',
        }
    },
}));

export const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
}));

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 100,
    height: 100,
    margin: '0 auto 16px',
    backgroundColor: theme.palette.primary.main,
}));

export const StyledProfileBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(3),
}));

export const StyledDivider = styled(Divider)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

export const StyledEditButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

export const StyledOrderItem = styled(ListItem)(({ theme }) => ({
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const StyledOrderHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

export const StyledOrderDate = styled(Typography)({
    display: 'block',
});

export const StyledTabs = styled(Tabs)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

export const StyledEmptyState = styled(Typography)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    textAlign: 'center',
}));

export const StyledLoadingContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    display: 'flex',
    justifyContent: 'center',
}));

export const StyledErrorContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
})); 