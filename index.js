const express = require('express');
const axios = require('axios');
const { parse } = require('csv-parse');

const app = express();
const port = 3000;

const pincodeData = {};

// Function to fetch and parse CSV data from URL
async function fetchCSVData(url) {
  try {
    const response = await axios.get(url);
    const parser = parse(response.data, {
      columns: true,
      skip_empty_lines: true
    });

    for await (const row of parser) {
      pincodeData[row.Pincode] = {
        district: row.District,
        state: row.StateName
      };
    }

  } catch (error) {
    console.error('Error fetching or parsing CSV data:', error);
    throw error;
  }
}

// Route to get location information
app.get('/get_location', (req, res) => {
  const pincode = req.query.pincode;

  if (pincodeData[pincode]) {
    res.json({
      status: true,
      pincode: pincode,
      district: pincodeData[pincode].district,
      state: pincodeData[pincode].state
    });
  } else {
    res.status(404).json({
        status: false, 
        error: 'Pincode not found' 
    });
  }
});

// Start the server after fetching CSV data
async function startServer(csvUrl) {
  try {
    await fetchCSVData(csvUrl);
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// CSV URL
const csvUrl = 'https://assets.partner.incredmoney.com/public/pincodes_30052019.csv';
startServer(csvUrl);