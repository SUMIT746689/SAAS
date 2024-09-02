import { useEffect, useState } from 'react';
import axios from 'axios';

export const useClientFetch = (url, method = 'GET', body) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  let options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (body) {
    options = { ...options, body: JSON.stringify(body) };
  }

  const fetchData = async () => {
    try {
      const response = await axios.get(url, options);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, setData, error, reFetchData: fetchData };
};

export const useClientDataFetch = (url, method = 'GET', body, initial_value) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  let options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (body) {
    options = { ...options, body: JSON.stringify(body) };
  }

  const fetchData = async () => {
    try {
      const response = await axios.get(url, options);
      if (response.data?.success) setData(response.data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  const post = async ({ values, query }) => {
    const finalurl = query ? url + query : url;
    const { data } = await axios.get(finalurl, values);
    if (data.success) return [data.data, null];
    return [data.error.message, null];
  }

  return { data, setData, error, reFetchData: fetchData, post };
};
