
const API_CONTROLLER = "/api/notacredito";

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