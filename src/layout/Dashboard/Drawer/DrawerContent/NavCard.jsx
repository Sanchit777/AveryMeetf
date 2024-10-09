import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../../firebase';
// ==============================|| DRAWER CONTENT - NAVIGATION CARD ||============================== //

export default function NavCard() {

  const navigate = useNavigate()

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        // Remove user ID from local storage
        localStorage.removeItem('id');
        
        // Optionally, remove other related keys if necessary
        // localStorage.removeItem('otherKey');
  
        // Navigate to login page
        navigate('/login', { replace: true });
      })
      .catch((error) => {
        console.error('Error signing out:', error);
        // Handle any errors that might occur during sign out
      });
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        height: '50vh', // Full height for vertical alignment
        padding: 2, // Padding for spacing
      }}
    >
      <Button
        variant="contained"
        color="primary"
        sx={{
          width: '100%', // Full width button
          maxWidth: '300px', // Adjust width as per your design
        }}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Box>
  );
}
