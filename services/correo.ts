const API_CONTROLLER = "/api/correo";
export function EnviarCorreo(req : any) {
    const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
    let BaseUrl = base + API_CONTROLLER + "/enviar_correo";
  
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