# Agent API Lista
## Este MD File es una guia para que pueda servir como una pequena guia de como usar la api correctamente
### Antes de comenzar, PONER EN EL HEADER "x-rol" y despues poner "cliente" "analista" o "agente"
### Abajo hay mas detalles de todo lo que esta puesto

Base URL: http://localhost:3000

Headers de rol (cuando aplique):
- x-rol: cliente | agente | analista
- x-actor: nombre del usuario

Nota: los datos viven en memoria y se pierden al reiniciar.

Formato pensado para pegar directo en el Body (JSON) de Postman.

## GET /
Respuesta de salud basica. Sin body.

## Clientes

### POST /clientes (cliente)
```json
{
  "nombre": "Maria Lopez",
  "documento": "DUI123",
  "email": "maria@mail.com",
  "ingresos": 1800,
  "tieneMoraPrevia": false
}
```

### GET /clientes
Sin body. URL ejemplo: http://localhost:3000/clientes?q=maria

### GET /clientes/:id
Sin body. URL ejemplo: http://localhost:3000/clientes/1

### PUT /clientes/:id (cliente)
```json
{
  "ingresos": 2200,
  "tieneMoraPrevia": false
}
```

### DELETE /clientes/:id (cliente)
Sin body. URL ejemplo: http://localhost:3000/clientes/1

### POST /clientes/:id/documentos (cliente)
```json
{
  "tipo": "estado_cuenta",
  "nombre": "estado_cuenta_marzo.pdf",
  "url": "https://storage.local/doc/1"
}
```

### GET /clientes/:id/documentos
Sin body. URL ejemplo: http://localhost:3000/clientes/1/documentos

## Solicitudes

### POST /solicitudes (cliente)
```json
{
  "clienteId": 1,
  "monto": 5000,
  "plazo": 24,
  "proposito": "capital de trabajo"
}
```

### GET /solicitudes
Sin body. URL ejemplo: http://localhost:3000/solicitudes?estado=en_revision&minMonto=1000&scoreMin=60

### GET /solicitudes/:id
Sin body. URL ejemplo: http://localhost:3000/solicitudes/1

### PUT /solicitudes/:id (cliente)
```json
{
  "monto": 6000,
  "plazo": 30
}
```

### POST /solicitudes/:id/enviar (cliente)
Sin body. URL ejemplo: http://localhost:3000/solicitudes/1/enviar

### POST /solicitudes/:id/solicitar-reanalisis (analista)
Sin body. URL ejemplo: http://localhost:3000/solicitudes/1/solicitar-reanalisis

### POST /solicitudes/:id/reanalizar (agente)
Sin body. URL ejemplo: http://localhost:3000/solicitudes/1/reanalizar

### GET /solicitudes/:id/analisis
Sin body. URL ejemplo: http://localhost:3000/solicitudes/1/analisis

### POST /solicitudes/:id/revision (analista)
```json
{
  "decision": "aprobada",
  "justificacion": "score alto y ingresos estables",
  "docsAdicionalesSolicitados": null
}
```

### GET /solicitudes/:id/auditoria
Sin body. URL ejemplo: http://localhost:3000/solicitudes/1/auditoria

## Reportes

### GET /reportes
Sin body. URL ejemplo: http://localhost:3000/reportes

## Creditos

### POST /creditos (analista)
```json
{
  "solicitudId": 1,
  "clienteId": 1,
  "monto": 5000,
  "plazo": 24
}
```

### GET /creditos
Sin body. URL ejemplo: http://localhost:3000/creditos?estadoMora=al_dia&saldoMax=3000

### GET /creditos/:id
Sin body. URL ejemplo: http://localhost:3000/creditos/1

### PUT /creditos/:id (analista)
```json
{
  "plazo": 30
}
```

### DELETE /creditos/:id (analista)
Sin body. URL ejemplo: http://localhost:3000/creditos/1

### POST /creditos/:id/pagos (cliente)
```json
{
  "monto": 250,
  "fecha": "2026-05-25T10:00:00.000Z"
}
```
