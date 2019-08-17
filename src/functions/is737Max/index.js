/* global fetch:false */
import runWarm from '../../utils/run-warm';

function createAPIUrlFromQueryString(queryStringObject) {
  const base = 'https://api.flightstats.com/flex/schedules/rest/v1/json/flight';
  const flight = `${queryStringObject.airline}/${queryStringObject.flightNumber}`;
  const date = `${queryStringObject.year}/${queryStringObject.month}/${queryStringObject.day}`;
  const idAndKeySuffix = `?appId=${process.env.localID}&appKey=${process.env.localKey}`;

  return `${base}/${flight}/departing/${date}${idAndKeySuffix}`;
}

// Lambda handler. We are using an async function to simplify the code and
// remove the need to use a callback.
export const is737Max = async function is737Max(event) {
  const apiURL = createAPIUrlFromQueryString(event.queryStringParameters);

  const response = await fetch(apiURL);

  const responseJson = await response.json();

  let isAircraft737Max = false;

  if (
    responseJson.scheduledFlights[0].flightEquipmentIataCode === '7M7'
    || responseJson.scheduledFlights[0].flightEquipmentIataCode === '7M8'
    || responseJson.scheduledFlights[0].flightEquipmentIataCode === '7M9'
    || responseJson.scheduledFlights[0].flightEquipmentIataCode === '7MJ'
  ) {
    isAircraft737Max = true;
  }

  const res = {
    statusCode: 200,
    body: JSON.stringify({
      isAircraft737Max: isAircraft737Max ? 'Yes' : 'No',
    }),
  };

  return res;
};

// Export the hander wrapped in the "run warm" utility which will handle events
// from the scheduler, keeping our actual handler logic clean.
export default runWarm(is737Max);
