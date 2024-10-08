import PropTypes from 'prop-types';

// material-ui
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';

// assets
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined'; // Optional for use with warning

const iconSX = { fontSize: '0.75rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

export default function AnalyticEcommerce({ color = 'primary', title, count, percentage }) {
  // Determine the icon and color based on percentage
  const getIconAndColor = () => {
    if (percentage > 50) {
      return { icon: <RiseOutlined style={iconSX} />, color: color }; // Default color for increase
    } else if (percentage < 50) {
      return { icon: <FallOutlined style={iconSX} />, color: 'warning' }; // Use warning color for decrease
    }
    return { icon: null, color }; // Default color for exactly 50% (no icon shown)
  };

  const { icon, color: chipColor } = getIconAndColor();

  return (
    <MainCard contentSX={{ p: 2.25 }}>
      <Stack spacing={0.5}>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Grid container alignItems="center">
          <Grid item>
            <Typography variant="h4" color="inherit">
              {count}
            </Typography>
          </Grid>
          {percentage !== undefined && (
            <Grid item>
              <Chip
                variant="combined"
                color={chipColor}
                icon={icon}
                label={`${percentage}%`}
                sx={{ ml: 1.25, pl: 1 }}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </Stack>
    </MainCard>
  );
}

AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.string,
  percentage: PropTypes.number,
};
