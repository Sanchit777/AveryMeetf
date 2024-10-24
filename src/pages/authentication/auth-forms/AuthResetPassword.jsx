import PropTypes from 'prop-types';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../../firebase';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';

import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// project import
import AnimateButton from 'components/@extended/AnimateButton';

export default function AuthResetPassword() {
  const navigate = useNavigate();
  const db = getFirestore(); // Initialize Firestore

  return (
    <>
      <ToastContainer />
      <Formik
        initialValues={{
          email: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
        })}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            // Query Firestore to check if email exists
            const q = query(collection(db, 'users'), where('email', '==', values.email));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
              // Email not found in Firestore
              toast.error('Email is not registered');
              setErrors({ submit: 'Email is not registered.' });
              return; // Stop further execution
            }
            
            // If the email exists in Firestore, proceed to send the reset email
            await sendPasswordResetEmail(auth, values.email);
            toast.success('Password reset email has been sent to your registered email address');
            navigate('/login'); // Navigate to the login page after success
            
          } catch (error) {
            // Handle specific Firebase Auth errors
            switch (error.code) {
              case 'auth/invalid-email':
                toast.error('Invalid email format');
                setErrors({ submit: 'Invalid email format.' });
                break;
              case 'auth/user-not-found':
                toast.error('Email is not registered'); // Should not reach here due to Firestore check
                setErrors({ submit: 'Email is not registered.' });
                break;
              case 'auth/too-many-requests':
                toast.error('Too many requests. Please try again later.');
                setErrors({ submit: 'Too many requests. Please try again later.' });
                break;
              default:
                toast.error('Error sending password reset email');
                setErrors({ submit: 'Failed to send password reset email.' });
                break;
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-reset">Email Address</InputLabel>
                  <OutlinedInput
                    id="email-reset"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-reset">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Send Reset Email
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}

AuthResetPassword.propTypes = { isDemo: PropTypes.bool };
