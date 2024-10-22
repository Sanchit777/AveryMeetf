// material-ui
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import React, { useState, useEffect , useCallback} from 'react'
// project import
import MainCard from 'components/MainCard';
import OrdersTable from './OrdersTable';
import NOData from '../../assets/images/users/nodata.jpg'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
// assets

import avatar1 from 'assets/images/users/avatar-1.png';
import avatar2 from 'assets/images/users/avatar-2.png';
import avatar3 from 'assets/images/users/avatar-3.png';
import avatar4 from 'assets/images/users/avatar-4.png';
import Googlemeet from 'assets/images/logos/meet.png';
import Zoom from 'assets/images/logos/Zoom.png'
import Teams from 'assets/images/logos/teamsslogo.png'

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};



// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("id");
  const [selectedBotData, setSelectedBotData] = useState(null); // Replace with dynamic user ID as needed
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [bot_id, setbot_id] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://avery-meet.vercel.app/meetings', null, {
        params: { user_id: userId }, // Pass user_id as a query parameter
      });
      setMeetings(response.data);
      console.log("TT01:", response.data, "response ended:"); // Assuming response.data is the array of meeting objects
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Failed to load meetings: ' + (error.response ? error.response.data : error.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    if (!bot_id) {
      handleLastMeetingFetch();
    }
  }, [bot_id]); 

  useEffect(() => {
    fetchMeetings();
    // handleMeetingClick("0285fc5d-ca56-4e3b-b9ac-be272a07e5a0")
  },[]);

  const handleMeetingClick = async (bot_id) => {
    setLoadingSummary(true); 
    setbot_id(bot_id)// Start showing loader
    try {
      const response = await axios.get(`https://avery-meet.vercel.app/meeting_data`, {
        params: { bot_id, user_id: userId }  // Add user_id as a query parameter
      });
      const data = response.data;
      console.log(data)
      if (data && data.bot_data && data.meeting_summary) {
        setSelectedBotData({
          bot_data: data.bot_data,
          meeting_data: data.meeting_summary[0],
          is_last_meeting: false, // Assuming the meeting_data is an array, taking the first element
        });
      } else {
        console.error('Invalid data format received from backend.');
      }
    } catch (error) {
      console.error('Error fetching bot data:', error);
    } finally {
      setLoadingSummary(false); // Stop showing loader
    }
  };

  
  const validateMeetingUrl = (url) => {
    // Example implementation, make sure yours covers all platforms
    const googleMeetRegex = /https:\/\/meet\.google\.com\/.*/;
    const zoomRegex = /https:\/\/zoom\.us\/j\/.*/;
    const teamsRegex = /https:\/\/teams\.microsoft\.com\/.*\/meetup-join/;

    if (googleMeetRegex.test(url)) {
        return { isValid: true, platform: 'Google Meet' };
    } else if (zoomRegex.test(url)) {
        return { isValid: true, platform: 'Zoom' };
    } else if (teamsRegex.test(url)) {
        return { isValid: true, platform: 'Microsoft Teams' };
    } else {
        return { isValid: false };
    }
};


const sendBotToMeeting = async (meetingUrl) => {
  const url = "https://avery-meet.vercel.app/start-meeting-bot"; // Replace with your Python backend URL
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meeting_url: meetingUrl,
        user_id: userId,  // Ensure userId is defined in the outer scope
      }),
    });

    if (response.ok) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let receivedData = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          receivedData += chunk;

          const messages = receivedData.split('\n\n');
          for (let i = 0; i < messages.length - 1; i++) {
            try {
              const jsonChunk = JSON.parse(messages[i].replace(/^data: /, ''));
              console.log('Intermediate Response: ', jsonChunk);
              setSuccessMessage('Bot Status: ' + jsonChunk.status);
            } catch (e) {
              console.error("Error parsing JSON: ", e);
            }
          }

          // Keep the last message as potential incomplete JSON
          receivedData = messages[messages.length - 1];
        }
      }

      // Handle the final message after the stream is done
      try {
        if (receivedData) { // Ensure there is data to parse
          const jsonChunk = JSON.parse(receivedData);
          console.log('Final Response: ', jsonChunk);
          setSuccessMessage('Bot Status: ' + jsonChunk.status);
        }
      } catch (e) {
        console.error("Error parsing final JSON: ", e);
      }

      setSuccessMessage('Bot has successfully completed the meeting!');
      setError('');
    } else {
      const errorMessage = await response.text();
      setError('Failed to send bot to meeting: ' + errorMessage);
      setSuccessMessage('');
    }
  } catch (error) {
    setError('Network Error: ' + error.message);
    setSuccessMessage('');
  }
};






  const handleCreate = (e) => {
    e.preventDefault();
    if (meetingUrl) {
      const { isValid, platform } = validateMeetingUrl(meetingUrl);
      if (isValid) {
        setError('');
        setSuccessMessage(`Validated for ${platform}. Sending bot to the meeting...`);
        sendBotToMeeting(meetingUrl);
        toast.success('Averymeet is going to join meet in few seconds 🎉');
        setShow(false);
      } else {
        setError('Please enter a valid meeting URL from Google Meet, Zoom, or Microsoft Teams.');
        toast.error('Please enter a valid meeting URL from Google Meet, Zoom, or Microsoft Teams.'); // Display error toast
      }
    } else {
      setError('Please enter a meeting link.');
      toast.error('Please enter a meeting link.'); // Display error toast
    }
  };

 const handleChange = (e) => {
    const newUrl = e.target.value;
    setMeetingUrl(newUrl);
    console.log('Meeting URL changed to:', newUrl); // Log to verify
};


  const handleLastMeetingFetch = async () => {
    setLoadingSummary(true); // Start showing loader
    try {
      const response = await axios.get(`http://localhost:5000/last_meeting_summary`, {
        params: { user_id: userId,  } // Indicate that this is the last meeting fetch
      });
      const data = response.data;
      console.log(data);
      if (data && data.meeting_summary) {
        setSelectedBotData({
          bot_data: '',
          meeting_data: data.meeting_summary, 
          is_last_meeting: true,
        });
      } else {
        console.error('Invalid data format received from backend.');
      }
    } catch (error) {
      console.error('Error fetching last meeting data:', error);
    } finally {
      setLoadingSummary(false); // Stop showing loader
    }
  };

  const getMeetingLogo = (meetingUrl) => {
    if (meetingUrl.includes('meet.google.com')) {
      return Googlemeet;
    } else if (meetingUrl.includes('zoom.us')) {
      return Zoom;
    } else if (meetingUrl.includes('teams.microsoft.com')) {
      return Teams;
    }
    return null; 
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      {/* <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Dashboard</Typography>
      </Grid> */}
      {/* <Grid item xs={12} sm={6} md={4} lg={3}>
  <AnalyticEcommerce title="Total Meetings" count="4,42,236" percentage={59.3} />
</Grid>
<Grid item xs={12} sm={6} md={4} lg={3}>
  <AnalyticEcommerce title="Usage Time" count="18,800" percentage={27.4} />
</Grid>
<Grid item xs={12} sm={6} md={4} lg={3}>
  <AnalyticEcommerce title="Summaries Time" count="18,800" percentage={27.4} />
</Grid>
<Grid item xs={12} sm={6} md={4} lg={3}>
  <AnalyticEcommerce title="Usage Time" count="18,800" percentage={27.4} />
</Grid> */}

      <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />

      {/* row 2 */}
      {/* <Grid item xs={12} md={7} lg={8}>
        <UniqueVisitorCard />
      </Grid> */}
      {/* <Grid item xs={12} md={5} lg={4}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Income Overview</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack spacing={2}>
              <Typography variant="h6" color="text.secondary">
                This Week Statistics
              </Typography>
              <Typography variant="h3">$7,650</Typography>
            </Stack>
          </Box>
          <MonthlyBarChart />
        </MainCard>
      </Grid> */}

      {/* row 3 */}
      <Grid item xs={12} md={7} lg={8}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Last Meeting Details</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <OrdersTable 
            botData={selectedBotData ? selectedBotData.bot_data : null}
            meetingData={selectedBotData ? selectedBotData.meeting_data : null}
            is_last_meeting={selectedBotData ? selectedBotData.is_last_meeting : false} 
          />
        </MainCard>
      </Grid>
      {/* <Grid item xs={12} md={5} lg={4}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Analytics Report</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
            <ListItemButton divider>
              <ListItemText primary="Company Finance Growth" />
              <Typography variant="h5">+45.14%</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Company Expenses Ratio" />
              <Typography variant="h5">0.58%</Typography>
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary="Business Risk Cases" />
              <Typography variant="h5">Low</Typography>
            </ListItemButton>
          </List>
          <ReportAreaChart />
        </MainCard>
      </Grid> */}

      {/* row 4 */}
      {/* <Grid item xs={12} md={7} lg={8}>
        <SaleReportCard />
      </Grid> */}
      <Grid item xs={12} md={4} lg={4} sx={{ mb: 2 }}>
      <Typography variant="h5"  sx={{ mb: 2 }}>New Meeting</Typography>
      <Grid>
  <MainCard sx={{ mb: 2 }}>
    <Typography variant="h6" gutterBottom>
      Paste the link of your meeting. AveryMeet assistant will join the meeting in a few seconds.
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={9}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter meeting URL"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
        >
          Send
        </Button>
      </Grid>
    </Grid>
  </MainCard>
</Grid>
      <Grid container alignItems="center" justifyContent="space-between">
      <Grid item>
  <Typography variant="h5">Meetings History</Typography>
</Grid>
<Grid item />
<MainCard sx={{ mt: 2 }} content={false}>
  {loading && <Typography>Loading...</Typography>}
  {!loading  && (
    <>
      {meetings.length === 0 ? (
        <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '200px' }} display={'flex'} flexDirection={'column'}>
          <img 
            src={NOData} 
            alt="No meetings"
            style={{ width: '50%', height: '50%' }} 
          />
          <Typography variant="h5" align="center">No meetings to show</Typography>
        </Grid>
      ) : (
        <List
          component="nav"
          sx={{
            px: 0,
            py: 0,
            '& .MuiListItemButton-root': {
              py: 1.5,
              '& .MuiAvatar-root': avatarSX,
              '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' },
            },
          }}
        >
          {meetings.map((meeting, index) => (
            <ListItemButton key={index} divider onClick={() => handleMeetingClick(meeting.bot_id)}>
              <ListItemAvatar>
              <Avatar src={getMeetingLogo(meeting.meetingUrl)} /> 
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant="subtitle1">{meeting.meetingUrl}</Typography>}
                secondary={new Date(meeting.timestamp).toLocaleString()}
              />
              <ListItemSecondaryAction>
                <Stack alignItems="flex-end">
                  <Typography variant="subtitle1" noWrap>
                    {/* Add any additional info about the meeting if needed */}
                  </Typography>
                </Stack>
              </ListItemSecondaryAction>
            </ListItemButton>
          ))}
        </List>
      )}
    </>
  )}
</MainCard>
    </Grid>
        <MainCard sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Stack>
                  <Typography variant="h5" noWrap>
                    Help & Support Chat
                  </Typography>
                  <Typography variant="caption" color="secondary" noWrap>
                    Typical replay within 5 min
                  </Typography>
                </Stack>
              </Grid>
              <Grid item>
                <AvatarGroup sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                  <Avatar alt="Remy Sharp" src={avatar1} />
                  <Avatar alt="Travis Howard" src={avatar2} />
                  <Avatar alt="Cindy Baker" src={avatar3} />
                  <Avatar alt="Agnes Walker" src={avatar4} />
                </AvatarGroup>
              </Grid>
            </Grid>
            <Button size="small" variant="contained" sx={{ textTransform: 'capitalize' }}>
              Need Help?
            </Button>
          </Stack>
        </MainCard>
      </Grid>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </Grid>
    
  );
}
