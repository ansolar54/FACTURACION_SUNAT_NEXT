
const API_CONTROLLER = "/api/tiponotacred";

export function ObtenerTipo_NotaCredito(id_tipo_docu: number) {
    const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
    let BaseUrl = base + API_CONTROLLER + "/get_by_id_docu?id_tipo_docu=" + id_tipo_docu;
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
