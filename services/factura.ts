const API_CONTROLLER = "/api/factura";

export function GenerarSerieCorrelativo_Factura(ruc_emisor: string) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/generate_serie_correlativo?ruc_emisor=" + ruc_emisor;

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function GenerarXMLFactura(req: any) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/generar_xml";

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function ObtenerRutaFactura(nro_factura: string, ruc_emisor: string) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER +"/get_ruta_zip?nro_factura=" + nro_factura +
    "&ruc_emisor=" + ruc_emisor;

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function EnviarFactura(req: any) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/enviar_factura?archivo=" + req;

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function GuardarFactura(req: any) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/registrar";

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function ObtenerFacturaCliente(nro_factura: string, id_cliente: number) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/get_factura?nro_factura=" + nro_factura +
    "&id_cliente=" + id_cliente;
  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function GenerarPDF(req: any) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/generate_pdf";

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function DescargarPDFBase64(nombre_archivo: string) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/get_file_b64?nombre_archivo=" + nombre_archivo;

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function DescargarXMLBase64(nombre_archivo: string) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/get_file_b64_xml_nozip?nombre_archivo=" + nombre_archivo;

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function DescargarZIPBase64(nombre_archivo: string) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/get_file_b64_xml?nombre_archivo=" + nombre_archivo;

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function DescargarCDRBase64(nombre_archivo: string) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/get_file_b64_cdr?nombre_archivo=" + nombre_archivo;

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        reject(error);
      });
  });
}