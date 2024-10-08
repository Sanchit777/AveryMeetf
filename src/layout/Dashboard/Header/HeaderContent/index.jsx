import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { GithubOutlined } from '@ant-design/icons'; // Import your icons

// Project imports
import Search from './Search';
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '0 16px', // Add padding to the header
      }}
    >
      {/* Search component for larger screens */}
      {/* {!downLG && <Search />} */}

      {/* Left side content */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* You can add other components like notifications or search here */}
        {/* <Notification /> */}
        {/* {!downLG && <Search />} */}
      </Box>

      {/* Right side content - Profile section */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Uncomment and use if you want to include GitHub link */}
        {/* <IconButton
          component={Link}
          href="https://github.com/codedthemes/mantis-free-react-admin-template"
          target="_blank"
          disableRipple
          color="secondary"
          title="Download Free Version"
          sx={{ color: 'text.primary', bgcolor: 'grey.100' }}
        >
          <GithubOutlined />
        </IconButton> */}

        {/* Profile component */}
        {!downLG && <Profile />}

        {/* Mobile section for smaller screens */}
        {/* {downLG && <MobileSection />} */}
      </Box>
    </Box>
  );
}
