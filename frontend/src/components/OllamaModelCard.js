import React from 'react';

const OllamaModelCard = ({ model }) => {
  return (
    <div className="card border-primary shadow-sm" style={{ minWidth: "200px", maxWidth: "250px" }}>
      <div className="card-header bg-transparent border-primary d-flex justify-content-between align-items-center p-2">
        <h6 className="card-title mb-0 text-truncate" style={{ fontSize: "0.8rem", maxWidth: "150px" }}>
          {model.name}
        </h6>
        <span 
          className={`badge badge-${model.status === 'active' ? 'success' : 'warning'} badge-pill`} 
          style={{ fontSize: "0.6rem" }}
        >
          {model.status}
        </span>
      </div>
      <div className="card-body p-2 text-center">
        <div className="row no-gutters">
          <div className="col-6 border-right">
            <i className="fas fa-microchip text-primary" style={{ fontSize: "1.5rem" }}></i>
            <div className="mt-1">
              <small className="text-muted" style={{ fontSize: "0.6rem" }}>CPU</small>
              <p className="mb-0" style={{ fontSize: "0.8rem" }}>
                {model.cpuUsage}%
              </p>
            </div>
          </div>
          <div className="col-6">
            <i className="fas fa-memory text-warning" style={{ fontSize: "1.5rem" }}></i>
            <div className="mt-1">
              <small className="text-muted" style={{ fontSize: "0.6rem" }}>Memoria</small>
              <p className="mb-0" style={{ fontSize: "0.8rem" }}>
                {model.memoryUsage}%
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer bg-transparent border-primary p-2">
        <div className="row no-gutters">
          <div className="col-6">
            <small className="text-muted" style={{ fontSize: "0.6rem" }}>Tamaño</small>
            <p className="mb-0" style={{ fontSize: "0.7rem" }}>
              {model.size}
            </p>
          </div>
          <div className="col-6 text-right">
            <small className="text-muted" style={{ fontSize: "0.6rem" }}>Tokens</small>
            <p className="mb-0" style={{ fontSize: "0.7rem" }}>
              {model.tokens}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const OllamaModelList = ({ models }) => {
  return (
    <div className="row">
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card card-stats">
          <div className="card-body">
            <div className="row">
              <div className="col">
                <h5 className="card-title text-uppercase text-muted mb-0">Modelos Disponibles</h5>
                <span className="h2 font-weight-bold mb-0" id="totalModelsEl">
                  {models.length}
                </span>
              </div>
              <div className="col-auto">
                <div className="icon icon-shape bg-gradient-red text-white rounded-circle shadow">
                  <i className="ni ni-app"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card card-stats">
          <div className="card-body">
            <div className="row">
              <div className="col">
                <h5 className="card-title text-uppercase text-muted mb-0">Modelos Activos</h5>
                <span className="h2 font-weight-bold mb-0" id="activeModelsEl">
                  {models.filter(m => m.status === 'active').length}
                </span>
              </div>
              <div className="col-auto">
                <div className="icon icon-shape bg-gradient-green text-white rounded-circle shadow">
                  <i className="ni ni-active-40"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card card-stats">
          <div className="card-body">
            <div className="row">
              <div className="col">
                <h5 className="card-title text-uppercase text-muted mb-0">Modelos en Carga</h5>
                <span className="h2 font-weight-bold mb-0" id="loadingModelsEl">
                  {models.filter(m => m.status !== 'active').length}
                </span>
              </div>
              <div className="col-auto">
                <div className="icon icon-shape bg-gradient-orange text-white rounded-circle shadow">
                  <i className="ni ni-cloud-download-95"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="modelCardsContainer" className="row">
        <div className="card-deck">
          {models.map((model, index) => (
            <OllamaModelCard key={index} model={model} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OllamaModelList;
