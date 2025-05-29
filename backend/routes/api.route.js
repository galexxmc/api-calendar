const router = require('express').Router();
const { google } = require('googleapis');
const https = require('https'); // Aunque no lo uses directamente aquí, podría ser útil para otras configuraciones

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'http://localhost:3000'
);

router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

router.post('/create-tokens', async (req, res, next) => {
  try {
    const { code } = req.body;

    // ¡SOLO PARA DESARROLLO! Deshabilitar la verificación de certificados justo antes de la llamada
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const { tokens } = await oauth2Client.getToken(code);

    // ¡SOLO PARA DESARROLLO! Volver a habilitar la verificación después de la llamada exitosa
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

    res.send(tokens);
  } catch (error) {
    // ¡SOLO PARA DESARROLLO! Asegurarse de volver a habilitar la verificación en caso de error
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
    next(error);
  }
});

router.post('/create-event', async (req, res, next) => {
  try {
    const { summary, startDateTime, endtDateTime } = req.body;

    // ¡SOLO PARA DESARROLLO! Deshabilitar la verificación de certificados justo antes de la llamada a la API de Google Calendar
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const calendar = google.calendar('v3');

    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      requestBody: {
        summary: summary,
        colorId: '7',
        start: {
          dateTime: new Date(startDateTime),
        },
        end: {
          dateTime: new Date(endtDateTime),
        },
        conferenceData: {
          createRequest: {
            requestId: `random-id-${new Date().getTime()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      },
      conferenceDataVersion: 1,
    });

    // ¡SOLO PARA DESARROLLO! Volver a habilitar la verificación después de la llamada exitosa
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

    res.send(response.data);
  } catch (error) {
    // ¡SOLO PARA DESARROLLO! Asegurarse de volver a habilitar la verificación en caso de error
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
    next(error);
  }
});

module.exports = router;