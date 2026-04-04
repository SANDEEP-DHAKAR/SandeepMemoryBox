import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useTrips = () => {
    const { getAuthHeaders } = useContext(AuthContext);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch private trips (requires auth)
    const fetchPrivateTrips = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/api/trips`, {
                headers: getAuthHeaders()
            });
            setTrips(res.data);
        } catch (err) {
            console.error('Error fetching private trips:', err);
            setError(err.response?.data?.message || 'Failed to fetch trips');
        } finally {
            setLoading(false);
        }
    };

    // Fetch public trip by publicId (no auth required)
    const fetchPublicTrip = async (publicId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/api/trips/p/${publicId}`);
            return res.data; // Return the trip data
        } catch (err) {
            console.error('Error fetching public trip:', err);
            setError(err.response?.data?.message || 'Failed to fetch public trip');
            throw err; // Re-throw for component handling
        } finally {
            setLoading(false);
        }
    };

    // Fetch all public trips (assuming there's an endpoint, or modify as needed)
    const fetchPublicTrips = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/api/trips/public`); // Adjust endpoint if different
            setTrips(res.data);
        } catch (err) {
            console.error('Error fetching public trips:', err);
            setError(err.response?.data?.message || 'Failed to fetch public trips');
        } finally {
            setLoading(false);
        }
    };

    return {
        trips,
        loading,
        error,
        fetchPrivateTrips,
        fetchPublicTrip,
        fetchPublicTrips
    };
};