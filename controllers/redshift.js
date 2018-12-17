const mongoose = require('mongoose');
const path = require('path');
const Request = require('request');
const Redshift = require('../models/redshift');

exports.import_data = (req,res,next) => {
    Request.get({
      "headers": {
          "content-type": "application/json",  
      },
      "url": "https://7zm9ekttt1.execute-api.us-east-2.amazonaws.com/test/pets/"
  }, (err, response, body) => {
      data = JSON.parse(body);
      if(response.statusCode == 200 ){
       
        Redshift.insertMany(data)
        .then((result) => {
            console.log("result ", result);
            res.status(200).json({'success': 'new documents added!', 'data': result});
        })
        .catch(err => {
            console.error("error ", err);
            res.status(400).json({err});
        });
        
      }else{
        return res.status(200).json({
            error: err
        });
      }
    });
  }