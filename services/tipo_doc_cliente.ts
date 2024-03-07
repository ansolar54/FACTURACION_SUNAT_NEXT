const API_CONTROLLER = "/api/tipodoc";

export function ListadoTipoDocCliente() {  
    return new Promise((resolve, reject) => {
      fetch(`${process.env.NEXT_PUBLIC_API_ROOT_IIS + API_CONTROLLER}/get_all`, {
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