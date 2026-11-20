import * as requestService from '../services/request.service.js';

export function getMetadata(req, res) {
  res.status(200).json({ data: requestService.getMetadata() });
}

export function create(req, res) {
  res.status(201).json({ data: requestService.createRequest(req.body) });
}

export function list(req, res) {
  const data = requestService.listRequests(req.query);
  res.status(200).json({ data, total: data.length });
}

export function getById(req, res) {
  res.status(200).json({ data: requestService.getRequest(req.params.id) });
}

export function update(req, res) {
  res.status(200).json({ data: requestService.updateRequest(req.params.id, req.body) });
}

export function remove(req, res) {
  res.status(200).json({ data: requestService.deleteRequest(req.params.id) });
}

export function advanceStatus(req, res) {
  res.status(200).json({ data: requestService.advanceStatus(req.params.id, req.body) });
}

export function getHistory(req, res) {
  res.status(200).json({ data: requestService.getRequestHistory(req.params.id) });
}

export function getDashboard(req, res) {
    res.status(200).json({ data: requestService.getDashboard() });
}
  