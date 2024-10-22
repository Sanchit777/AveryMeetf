import React, { useRef, useState, useEffect } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import axios from 'axios'; // Import axios for making API requests
import MainCard from 'components/MainCard';
import ComponentSkeleton from './ComponentSkeleton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import  CircularProgress  from '@mui/material/CircularProgress';
import { set } from 'lodash';

export default function ComponentTypography() {
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState(''); // State to hold summary
  const [meetingType, setMeetingType] = useState('meeting'); // State for meeting type
  const [uploads, setUploads] = useState([]); // State to store uploads data
  const userId = localStorage.getItem("id");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState('');
  const [selectedSummary, setSelectedSummary] = useState('');

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };



  const handleOpenModal = (transcription, summary) => {
    const meetingData = { transcription }; // Mock the meetingData format
    setSelectedTranscription(renderSecondApiContent(meetingData));
    setSelectedSummary(summary);
    setOpen(true);
  };

  const renderSecondApiContent = (meetingData) => {
    if (!meetingData || Object.keys(meetingData).length === 0) {
      return <h3>No meeting data available.</h3>;
    }

    const transcriptionEntries = meetingData.transcription.map((entry, index) => {
      const speakerMatch = entry.match(/^(Speaker \w+):(.*)/);
      const speakerName = speakerMatch ? speakerMatch[1].trim() : '';
      const text = speakerMatch ? speakerMatch[2].trim() : entry;

      return { speakerName, text, order: index };
    });

    let startFiltering = false;
    const formattedTranscription = transcriptionEntries
      .map((entry) => {
        const { speakerName, text } = entry;

        if (!startFiltering && text.toLowerCase() === 'thank you.') {
          return null;
        } else if (text.length > 0) {
          startFiltering = true;
        }

        if (!speakerName) {
          return null;
        }

        return (
          <div key={entry.order}>
            <strong>{speakerName}:- </strong> {text}
          </div>
        );
      })
      .filter(Boolean);

    return <div>{formattedTranscription}</div>;
  };

  const handleCloseModal = () => {
    setOpen(false);
  };
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      // Check if the file is an mp3 file
      if (file.type !== 'audio/mpeg') {
        setUploadStatus('Please upload an MP3 file.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      if (!userId) {
        setUploadStatus('User ID not found in local storage.');
        return;
      }

      // Append user ID to form data
      formData.append('user_id', userId);
      // Append meeting type to form data
      formData.append('meeting_type', meetingType);
      setLoading(true)
      try {
        // Update UI to show uploading status
        setUploadStatus('Uploading...');

        // Make API request to localhost:5000/transcribe
        const response = await axios.post('https://avery-meet.vercel.app/transcribe', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Handle the response
        setUploadStatus('File uploaded successfully!');

        // Store the transcription data
        const meetingData = { transcription: response.data.transcription }; // Ensure it matches the expected format
        setSelectedTranscription(meetingData);

        // Render the transcription properly using the renderSecondApiContent function
        const formattedTranscription = renderSecondApiContent(meetingData);
        setSelectedTranscription(formattedTranscription); // Set the rendered transcription

        // Store the summary directly
        setSelectedSummary(response.data.summary);

        setOpen(true);
        setLoading(false)
        console.log(response.data)
      } catch (error) {
        setLoading(false)
        console.error('Error uploading file:', error);
        setUploadStatus('An error occurred while uploading the file.');
      }
    }
  };

  // Fetch uploads data from the API
  useEffect(() => {
    const fetchUploads = async () => {
      if (!userId) return;

      try {
        const response = await axios.get('https://avery-meet.vercel.app/uploads', {
          params: { user_id: userId },
        });
        console.log(response.data);
        // Update the uploads state with the response data
        setUploads(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching uploads:', error);
        setLoading(false);
      }
    };

    fetchUploads();
  }, [userId]);

  const handleDeleteUpload = async (meetingId) => {
    if (!userId) {
      console.error('User ID not found in local storage.');
      return;
    }

    try {
      // Make API request to delete the meeting
      const response = await axios.delete('https://avery-meet.vercel.app/delete_upload', {
        params: { user_id: userId, meeting_id: meetingId },
      });

      // Log the success message
      console.log(response.data.message);

      // Refresh the uploads after deletion
      setUploads((prevUploads) => prevUploads.filter((upload) => upload.id !== meetingId));
    } catch (error) {
      console.error('Error deleting upload:', error);
    }
  };


  return (

    <ComponentSkeleton>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            <MainCard title="Upload Meeting">
              <Stack spacing={2}>
                <Typography variant="body1" gutterBottom>
                  Works best with  mp3
                  <br />
                  Max 4h per recording.
                  <br />
                  Processing takes 10-15 mins depending on the size of the recording.
                </Typography>

                {/* Radio buttons for meeting type */}
                <Typography variant="body1">Select Meeting Type:</Typography>
                <RadioGroup
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                >
                  <FormControlLabel value="interview" control={<Radio />} label="Interview" />
                  <FormControlLabel value="meeting" control={<Radio />} label="Meeting" />
                  <FormControlLabel value="discussion" control={<Radio />} label="Discussion" />
                </RadioGroup>

                {/* Hidden file input element */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
               <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFileUploadClick}
                  disabled={loading} // Disable button while loading
                  style={{ position: 'relative' }} // Set position relative for loader positioning
                >
                  {loading && (
                    <CircularProgress
                      size={24}
                      style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                    />
                  )}
                  {!loading && 'Upload Meeting'}
                </Button>

                

                {/* Display transcription */}
                {transcription && (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    <strong>Transcription:</strong>
                    <br />
                    {transcription}
                  </Typography>
                )}

                {/* Display summary */}
                {summary && (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    <strong>Summary:</strong>
                    <br />
                    {summary}
                  </Typography>
                )}
              </Stack>
            </MainCard>

            <MainCard title="Fair Use Policy">
              <Stack spacing={1}>
                <Typography variant="body1">
                  We expect you to upload professional content related to meetings, webinars, online classes, or similar as per our terms and conditions.
                </Typography>
              </Stack>
            </MainCard>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={6}>
          <MainCard title="Uploads">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h6">File Name</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h6">Uploaded</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h6">Status</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h6">Actions</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />

            {/* Check if loading or uploads available */}
            {loading ? (
              <Typography variant="body1">Loading uploads...</Typography>
            ) : uploads.length > 0 ? (
              uploads.map((upload) => (
                <React.Fragment key={upload.id}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body1" noWrap>{upload.file_name || 'Untitled'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body1" noWrap>{upload.timestamp || 'Unknown'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body1" noWrap>{'Success'}</Typography>
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack direction="column" spacing={1} sx={{ marginLeft: '-25px', }} >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Button
                            variant="contained"
                            sx={{ color: 'white', width: '100px', height: '40px' }}
                            color="primary"
                            onClick={() => handleOpenModal(upload.transcription, upload.summary)}
                          >
                            Details
                          </Button>
                          <Button
                            variant="outlined"
                            sx={{ color: 'red', height: '40px' }}
                            color="error"
                            onClick={() => handleDeleteUpload(upload.id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                </React.Fragment>
              ))
            ) : (
              <Typography variant="body1">There are no uploads yet!</Typography>
            )}
          </MainCard>
        </Grid>
      </Grid>
      {/* Modal for displaying transcription and summary */}
      <Dialog open={open} onClose={handleCloseModal} fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          Transcription and Summary Details
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            <strong>Transcription:</strong>
            <br />
            {selectedTranscription}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', marginTop: 2 }}>
            <strong>Summary:</strong>
            <br />
            {selectedSummary}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ComponentSkeleton>
  );
}