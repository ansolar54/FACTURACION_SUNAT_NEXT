const API_CONTROLLER = "/api/factura";

export function GenerarSerieCorrelativo_Factura(ruc_emisor : string) {
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