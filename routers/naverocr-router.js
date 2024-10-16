const express = require('express');
const naverocr_router = express.Router();
const multer = require('multer');
const cors = require('cors');
const NodeCache = require('node-cache');
const axios = require('axios');
const fs = require('fs');

const cache = new NodeCache();

/* Definition of Constant Variable */
const MY_OCR_API_URL = "https://..";
const MY_OCR_SECRET_KEY = "";

/* Definition of Headers, Required Variable */
let config = {
  headers: {
    "Content-Type": "application/json",
    "X-OCR-SECRET": MY_OCR_SECRET_KEY
  }
}

naverocr_router.use(cors());

// set up multer middleware to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

let sumText = "";

// handle file upload request
naverocr_router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // extract the uploaded file data from the request
    const fileData = req.file.buffer;

    // save the file data to the cache
    cache.set('image', fileData);

    // encode the image data as base64
    const base64ImageData = fileData.toString('base64');

    // send the image data to the Naver Clova OCR API server
    const response = await axios.post(MY_OCR_API_URL, {
      "images": [
        {
          "format": "jpg",
          "name": "medium",
          "data": base64ImageData
        }
      ],
      "lang": "ko",
      "requestId": "string",
      // "resultType": "string",
      "timestamp": new Date().getTime(),
      "version": "V2"
    }, config);
    // parse the response from the Naver Clova OCR API server to extract the converted text
    //    const convertedText = response.data.recognitionResult.recognitionResults[0].text;

    let movieJson = JSON.stringify(response.data.images[0]);

    response.data.images[0].fields.forEach(element => {
      console.log(element.inferText);
      sumText += " " + element.inferText;
    });

    console.log("-------------------");
    console.log(sumText);
    console.log("-------------------");


    // send the converted text back to the client
    res.status(200).send({ text: sumText });

    // save the converted text to a file
    // fs.writeFileSync('ocr-text.txt', sumText, 'utf-8');

    let time = Date.now();
    fs.writeFileSync(`${time}.txt`, movieJson, 'utf-8');
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error.' });
  }
});

module.exports = naverocr_router;