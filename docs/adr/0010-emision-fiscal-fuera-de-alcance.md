# La emisión fiscal con ARCA/AFIP queda fuera del alcance de esta versión

El sistema emite solo comprobantes internos, identificados como "X – no válido como factura" y sin letra (A/B/C). Se conservan el modo de emisión en la configuración (RF-44) y en cada comprobante, con el modo fiscal visible pero no disponible, para no tener que migrar datos al integrarlo. RF-45 (envío a ARCA/AFIP) y RNF-12 (reintento de emisión fiscal) se posponen, y no se guardan credenciales fiscales en la base de datos.
