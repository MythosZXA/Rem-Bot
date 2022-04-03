// environment variables
require('dotenv').config();

const { InfluxDB } = require('@influxdata/influxdb-client');
const { Point } = require('@influxdata/influxdb-client');

const influxClient = new InfluxDB({ url: 'http://localhost:8086', token: process.env.influxToken });
const writeApi = influxClient.getWriteApi('Re:Zero', 'Rem');


function writeToInflux(measurement, field, value) {
  // writeApi.useDefaultTags({ Server: serverName });
  const point = new Point(measurement).floatField(field, value);
  writeApi.writePoint(point);
}

module.exports = {
  writeToInflux,
};