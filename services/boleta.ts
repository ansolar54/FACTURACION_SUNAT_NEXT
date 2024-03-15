
const API_CONTROLLER = "/api/boleta";

export function GenerarSerieCorrelativo_Boleta(ruc_emisor: string) {
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

export function GenerarXMLBoleta(req : any) {
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

export function ObtenerRutaBoleta(nro_boleta: string, ruc_emisor: string) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/get_ruta_zip?nro_boleta=" + nro_boleta +
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

export function EnviarBoleta(req : any) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/enviar_boleta?archivo=" + req;

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

export function GuardarBoleta(req : any) {
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

export function ObtenerBoletaCliente(nro_boleta: string, id_cliente: number) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/get_boleta?nro_boleta=" + nro_boleta +
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

export function GenerarPDFBoleta(req: any) {
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