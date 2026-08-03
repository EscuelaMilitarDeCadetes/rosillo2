import React from 'react';

// Datos de ejemplo para los videos. En el futuro, podrías obtener esto de tu API.
const videos = [
  { id: 'th0hgA-qSLI', title: 'Introducción a la Plataforma ROSILLO', description: 'Un recorrido general por las funcionalidades principales de la plataforma.' },
  { id: 'VIDEO_ID_2', title: 'Cómo Crear un Nuevo Proyecto', description: 'Paso a paso para registrar un nuevo proyecto en una convocatoria abierta.' },
  { id: 'VIDEO_ID_3', title: 'Gestión de Documentos', description: 'Aprende a subir y hacer seguimiento a los documentos requeridos para tu proyecto.' },
  { id: 'VIDEO_ID_4', title: 'Registro de Avances', description: 'Cómo registrar los avances y cumplir con los puntos de control de tu investigación.' },
  // ... puedes añadir más videos aquí
];

const HelpPage = () => {
  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1>Centro de Ayuda</h1>
        <p className="lead">Encuentra tutoriales en video para aprovechar al máximo la plataforma ROSILLO.</p>
      </div>

      <div className="row g-4">
        {videos.map((video) => (
          <div className="col-md-6 col-lg-4" key={video.id}>
            <div className="card h-100 shadow-sm">
              <div className="ratio ratio-16x9">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="card-body">
                <h5 className="card-title">{video.title}</h5>
                <p className="card-text">{video.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpPage;
