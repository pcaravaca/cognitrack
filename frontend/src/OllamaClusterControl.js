import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  Row, 
  Col, 
  Button 
} from 'reactstrap';
import axios from 'axios';
import io from 'socket.io-client';

const OllamaClusterControl = () => {
  const [clusterStats, setClusterStats] = useState({
    totalNodes: 0,
    activeNodes: 0,
    modelCount: 0,
    cpuUsage: 0,
    memoryUsage: 0
  });

  const [connectionStatus, setConnectionStatus] = useState({
    primary: false,
    secondary: false
  });

  useEffect(() => {
    // Conexión con Socket.IO para actualización en tiempo real
    const socket = io('http://localhost:5000');

    socket.on('ollama_cluster_metrics', (data) => {
      setClusterStats({
        totalNodes: data.totalNodes,
        activeNodes: data.activeNodes,
        modelCount: data.modelCount,
        cpuUsage: data.cpuUsage,
        memoryUsage: data.memoryUsage
      });

      setConnectionStatus({
        primary: data.nodes[0].connected,
        secondary: data.nodes[1].connected
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleScaleCluster = async (direction) => {
    try {
      const response = await axios.post('/api/ollama/scale', { 
        direction 
      });
      
      // Actualizar estado local después de escalar
      setClusterStats(response.data.clusterStats);
    } catch (error) {
      console.error('Error escalando cluster:', error);
    }
  };

  return (
    <Row>
      <Col lg="3">
        <Card className="card-stats mb-4 mb-lg-0">
          <CardBody>
            <Row>
              <div className="col">
                <h6 className="text-uppercase text-muted mb-0">
                  Nodos de Cluster
                </h6>
                <span className="h2 font-weight-bold mb-0">
                  {clusterStats.activeNodes} / {clusterStats.totalNodes}
                </span>
              </div>
              <Col className="col-auto">
                <div className="icon icon-shape bg-primary text-white rounded-circle shadow">
                  <i className="fas fa-server" />
                </div>
              </Col>
            </Row>
            <div className="mt-3 mb-0 text-muted text-sm d-flex justify-content-between align-items-center">
              <Button 
                color="success" 
                size="sm"
                onClick={() => handleScaleCluster('up')}
                disabled={clusterStats.activeNodes >= clusterStats.totalNodes}
              >
                <i className="fas fa-plus mr-1" /> Escalar
              </Button>
              <Button 
                color="danger" 
                size="sm"
                onClick={() => handleScaleCluster('down')}
                disabled={clusterStats.activeNodes <= 1}
              >
                <i className="fas fa-minus mr-1" /> Reducir
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>

      <Col lg="3">
        <Card className="card-stats mb-4 mb-lg-0">
          <CardBody>
            <Row>
              <div className="col">
                <h6 className="text-uppercase text-muted mb-0">
                  Modelos Desplegados
                </h6>
                <span className="h2 font-weight-bold mb-0">
                  {clusterStats.modelCount}
                </span>
              </div>
              <Col className="col-auto">
                <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                  <i className="fas fa-layer-group" />
                </div>
              </Col>
            </Row>
            <div className="mt-3 mb-0 text-muted text-sm d-flex justify-content-between">
              <span>Estado Conexión:</span>
              <div>
                <span className={`badge mr-1 ${connectionStatus.primary ? 'badge-success' : 'badge-danger'}`}>
                  Nodo 1
                </span>
                <span className={`badge ${connectionStatus.secondary ? 'badge-success' : 'badge-danger'}`}>
                  Nodo 2
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>

      <Col lg="3">
        <Card className="card-stats mb-4 mb-lg-0">
          <CardBody>
            <Row>
              <div className="col">
                <h6 className="text-uppercase text-muted mb-0">
                  Uso de CPU
                </h6>
                <span className="h2 font-weight-bold mb-0">
                  {clusterStats.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <Col className="col-auto">
                <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                  <i className="fas fa-microchip" />
                </div>
              </Col>
            </Row>
            <p className="mt-3 mb-0 text-muted text-sm">
              <span className={`mr-2 ${clusterStats.cpuUsage > 70 ? 'text-danger' : 'text-success'}`}>
                <i className={`fa ${clusterStats.cpuUsage > 70 ? 'fa-arrow-up' : 'fa-arrow-down'}`} />
                {clusterStats.cpuUsage > 70 ? 'Alto' : 'Normal'}
              </span>
              <span className="text-nowrap">Uso de Recursos</span>
            </p>
          </CardBody>
        </Card>
      </Col>

      <Col lg="3">
        <Card className="card-stats mb-4 mb-lg-0">
          <CardBody>
            <Row>
              <div className="col">
                <h6 className="text-uppercase text-muted mb-0">
                  Memoria
                </h6>
                <span className="h2 font-weight-bold mb-0">
                  {clusterStats.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <Col className="col-auto">
                <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                  <i className="fas fa-memory" />
                </div>
              </Col>
            </Row>
            <p className="mt-3 mb-0 text-muted text-sm">
              <span className={`mr-2 ${clusterStats.memoryUsage > 80 ? 'text-danger' : 'text-success'}`}>
                <i className={`fa ${clusterStats.memoryUsage > 80 ? 'fa-arrow-up' : 'fa-arrow-down'}`} />
                {clusterStats.memoryUsage > 80 ? 'Crítico' : 'Estable'}
              </span>
              <span className="text-nowrap">Estado de Memoria</span>
            </p>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default OllamaClusterControl;
