import fetch from 'node-fetch';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());

app.use(express.static('public'));

// location tracking APIs
app.get('/api/get-count', async (req, res) => {
  let url = process.env.API_GET_COUNT
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.get('/api/get-location', async (req, res) => {
  let url = `${process.env.API_GET_LOCATION}?primemover_id=${req.query.primemover_id}`
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

// productivity APIs
app.get('/api/get-dates', async (req, res) => {
  let url = `${process.env.API_GET_DATES}?primemover_id=${req.query.primemover_id}`
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.get('/api/get-cyclecount', async (req, res) => {
  let url = `${process.env.API_GET_CYCLECOUNT}?` +
            `primemover_id=${req.query.primemover_id}` +
            `&start_date=${req.query.start_date}` +
            `&end_date=${req.query.end_date}`

  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.get('/api/get-cycletimes', async (req, res) => {
  let url = `${process.env.API_GET_CYCLETIMES}?` +
            `primemover_id=${req.query.primemover_id}` +
            `&start_date=${req.query.start_date}` +
            `&end_date=${req.query.end_date}`

  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.get('/api/get-breakdown', async (req, res) => {
  let url = `${process.env.API_GET_BREAKDOWN}?` +
            `primemover_id=${req.query.primemover_id}` +
            `&date=${req.query.date}`

  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.get('/api/get-subactivity', async (req, res) => {
  let url = `${process.env.API_GET_SUBACT}?` +
            `primemover_id=${req.query.primemover_id}` +
            `&date=${req.query.date}` +
            `&sub_activity=${req.query.sub_activity}`;

  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

// road condition APIs
app.get('/api/get-coordinates', async (req, res) => {
  let url = process.env.API_GET_COORD
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.get('/api/get-sections', async (req, res) => {
  let url = process.env.API_GET_SECTIONS
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
