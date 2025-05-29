import React, { useState } from 'react';
import './App.css';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginButton = ({ setSignedIn }) => {
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      const { code } = codeResponse;
      axios
        .post('/api/create-tokens', { code })
        .then(() => setSignedIn(true))
        .catch(error => console.log(error.message));
    },
    onError: () => {
      console.log('Error al iniciar sesión');
    },
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/calendar',
  });

  return (
    <div className="google-btn-container">
      <button className="google-btn" onClick={() => login()}>
        <img
          className="google-icon"
          src="https://rotulosmatesanz.com/wp-content/uploads/2017/09/2000px-Google_G_Logo.svg_.png"
          alt="Google logo"
        />
        Iniciar sesión con Google
      </button>
    </div>
  );
};

const App = () => {
  const [summary, setSummary] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endtDateTime, setEndtDateTime] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [meetLink, setMeetLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('/api/create-event', {
        summary,
        startDateTime,
        endtDateTime
      })
      .then(response => {
        const link = response.data.conferenceData.entryPoints[0].uri;
        setMeetLink(link);
      })
      .catch(error => console.log(error.message));
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="App">
        {/* Logo siempre visible y título solo si no ha iniciado sesión */}
        <header className="header">
          <img
            src="https://sistemas.oefa.gob.pe/plusd/assets/images/logooefa.png"
            alt="OEFA Logo"
            className="oefa-logo"
          />
          {!signedIn && <h1 className="title">Reuniones OEFA</h1>}
        </header>

        {!signedIn ? (
          <LoginButton setSignedIn={setSignedIn} />
        ) : (
          <>
            <div className="title-form">
              <h2>Formulario para Crear un Evento OEFA</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="summary">Título de la Reunión</label><br />
              <input
                type="text"
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              /><br />

              <label htmlFor="startDateTime">Fecha y Hora de Inicio</label><br />
              <input
                type="datetime-local"
                id="startDateTime"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
              /><br />

              <label htmlFor="endDateTime">Fecha y Hora de Fin</label><br />
              <input
                type="datetime-local"
                id="endDateTime"
                value={endtDateTime}
                onChange={(e) => setEndtDateTime(e.target.value)}
              /><br />

              <button type="submit">Crear evento</button>
            </form>
          </>
        )}

        {meetLink && (
          <div className="meet-link">
            <h3>Enlace de Google Meet:</h3>
            <a href={meetLink} target="_blank" rel="noopener noreferrer">{meetLink}</a>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;