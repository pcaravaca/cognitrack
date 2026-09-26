import React from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Container,
  Row,
  Col
} from "reactstrap";

const ModelStatCard = ({ 
  title = "Total Models", 
  value = "350", 
  percentage = 3.48, 
  icon = "fas fa-chart-bar",
  color = "bg-danger"
}) => {
  return (
    <Card className="card-stats mb-4 mb-xl-0">
      <CardBody>
        <Row>
          <div className="col">
            <CardTitle
              tag="h5"
              className="text-uppercase text-muted mb-0"
            >
              {title}
            </CardTitle>
            <span className="h2 font-weight-bold mb-0">
              {value}
            </span>
          </div>
          <Col className="col-auto">
            <div className={`icon icon-shape ${color} text-white rounded-circle shadow`}>
              <i className={icon} />
            </div>
          </Col>
        </Row>
        <p className="mt-3 mb-0 text-muted text-sm">
          <span className={`${percentage > 0 ? 'text-success' : 'text-danger'} mr-2`}>
            <i className={`fa ${percentage > 0 ? 'fa-arrow-up' : 'fa-arrow-down'}`} /> 
            {Math.abs(percentage)}%
          </span>
          <span className="text-nowrap">Since last month</span>
        </p>
      </CardBody>
    </Card>
  );
};

export default ModelStatCard;
