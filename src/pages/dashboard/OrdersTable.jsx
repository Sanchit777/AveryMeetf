import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// Material-UI imports
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import { margin, textAlign } from '@mui/system';

// ==============================|| ORDER TABLE ||============================== //

// Main component
export default function OrderTable({ botData = [], meetingData = {}, is_last_meeting = null }) {
  const [activeTab, setActiveTab] = useState(0);

  // Log botData and meetingData when component mounts or updates
  useEffect(() => {
    console.log('Bot Data from comp:', botData);
    console.log('Meeting Data from comp:', meetingData);
    console.log('Is Last Meeting:', is_last_meeting);
  }, [botData, meetingData, is_last_meeting]); // Dependency array to re-run effect when these change

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Conditional rendering based on is_last_meeting and activeTab
  const renderContent = () => {
    // Ensure meetingData is not null or undefined
    if (!meetingData || Object.keys(meetingData).length === 0) {
      return <h3>No meeting data available.</h3>;
    }

    const transcriptionEntries = meetingData.transcription.map(entry => {
      const cleanedEntry = entry.replace(/at \d+\.\d+ss/g, '').trim(); // Remove timestamps
      const timeMatch = entry.match(/at (\d+\.\d+)ss/); // Extract time for sorting
      const time = timeMatch ? parseFloat(timeMatch[1]) : 0; // Get the time value
      return { cleanedEntry, time }; // Return an object with cleaned entry and time
    });
    
    // Sort entries based on the time value
    transcriptionEntries.sort((a, b) => a.time - b.time);
    
    // Filter out "Thank you" until we find meaningful dialogue
    let startFiltering = false;
    const formattedTranscription = transcriptionEntries
      .map(entry => {
        // Extract the speaker's name from the cleaned entry
        const nameMatch = entry.cleanedEntry.match(/^(\w+\s\w+)(.*)/);
        const speakerName = nameMatch ? nameMatch[1] : ''; // Capture the speaker's name
        const text = nameMatch ? nameMatch[2].trim() : entry.cleanedEntry; // Capture the text
    
        // Check for initial "Thank you" entries
        if (!startFiltering && text.toLowerCase() === 'thank you.') {
          return null; // Skip this entry
        } else if (text.length > 0) {
          startFiltering = true; // Start processing entries after initial "Thank you"
        }
    
        // Skip entries without a speaker name
        if (!speakerName) {
          return null; // Ignore this entry
        }
    
        return (
          <div key={entry.time}>
            <strong>{speakerName} </strong> {text}
          </div>
        );
      })
      .filter(Boolean);// Join entries with newline for display
  

    const meetingDetails = (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Details of Meeting</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <strong>Attendees:- </strong>
                {meetingData.attendees?.length > 0
                  ? meetingData.attendees.map(attendee => attendee.name && attendee.name !== '-' ? attendee.name : 'Unknown').join(', ')
                  : 'No attendees available.'}
              </TableCell>
            </TableRow>
            {/* <TableRow>
            <TableCell>
              <strong>Meeting URL:</strong> 
              <Link href={meetingData.mp4_url} target="_blank" rel="noopener noreferrer">
                {meetingData.mp4_url || 'No URL available.'}
              </Link>
            </TableCell>
          </TableRow> */}
            <TableRow>
              <TableCell>
              <strong>Summary:- </strong> {meetingData.summary || 'No summary available.'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );

    const transcriptionContent = (
      <TableRow>
        <TableCell>
        <div>{formattedTranscription}</div>
        </TableCell>
      </TableRow>
    );

    const summaryContent = (
      <TableRow>
        <TableCell>
          <strong>Summary:</strong> {meetingData.summary || 'No summary available.'}
        </TableCell>
      </TableRow>
    );

    if (is_last_meeting === true) {
      if (activeTab === 0) {
        // If the active tab is Transcription
        return (
          <div>
            <h3 style={{ textAlign: 'center' }}>Last Meeting Transcription  Details</h3>
            {transcriptionContent}
          </div>
        );
      } else if (activeTab === 1) {
        // If the active tab is Summary
        return (
          <div>
            <h3 style={{ textAlign: 'center' }}>Last Meeting Summary  Details</h3>
            {meetingDetails}
          </div>
        );
      }
    } else if (is_last_meeting === false) {
      if (activeTab === 0) {
        // If the active tab is Transcription
        return (
          <div>
            <h3 style={{ textAlign: 'center' }}>Meeting Details</h3>
            {transcriptionContent}
          </div>
        );
      } else if (activeTab === 1) {
        // If the active tab is Summary
        return (
          <div>
            <h3 style={{ textAlign: 'center' }}>Meeting Details</h3>
            {meetingDetails}
          </div>
        );
      }
    } else {
      return <h3>No meeting data available.</h3>; // When is_last_meeting is null
    }
  };

  return (
    <Box>
      {/* Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="basic tabs example">
        <Tab label="Transcription" />
        <Tab label="Summary" />
      </Tabs>

      {/* Render content based on is_last_meeting and activeTab */}
      {renderContent()}

      {/* Table Container */}
      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' },
        }}
      >

      </TableContainer>
    </Box>
  );
}

// PropTypes for validation
OrderTable.propTypes = {
  botData: PropTypes.any, // Ensure botData is passed
  meetingData: PropTypes.object, // Ensure meetingData is an object
  is_last_meeting: PropTypes.bool, // Expecting a boolean value
};
