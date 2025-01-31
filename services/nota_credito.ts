
const API_CONTROLLER = "/api/notacredito";

export function GenerarSerieCorrelativo_NotaCredito(ruc_emisor: string, tipo_doc_sunat: number) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/generate_serie_correlativo?ruc_emisor=" + ruc_emisor + '&tipo_doc_sunat=' + tipo_doc_sunat;

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

export function GenerarXML_NotaCredito(req: any) {
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

export function ObtenerRutaNCredito(nro_nota_credito: string, ruc_emisor: string) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/get_ruta_zip?nro_nota_credito=" + nro_nota_credito +
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

export function EnviarNCredito(archivo : any) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/enviar_nota_credito?archivo=" + archivo;

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

export function RegistrarNCredito(req : any) {
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

export function GenerarPDFNotaCredito(req: any) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/generate_pdf_quest";

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

export function ObtenerListadoNotaCredito(fecha_emision: string, id_tipo: string, nro_documento: string, limit: number, offset: number) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/search?fecha_emision=" + fecha_emision + "&id_tipo=" + id_tipo +
      "&nro_documento=" + nro_documento + "&limit=" + limit + "&offset=" + offset;

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