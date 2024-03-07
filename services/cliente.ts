const API_CONTROLLER = "/api/cliente";

export function ObtenerClienteByCampo1(campo1 : string, limit : number, offset : number) {
    return new Promise((resolve, reject) => {
      fetch(`${process.env.NEXT_PUBLIC_API_ROOT_IIS + API_CONTROLLER}/search?campo1=${campo1}&limit=${limit}&offset=${offset}`,
        {
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

export function RegistrarCliente(req : any) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER +"/registrar";

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

export function EliminarCliente(id : number) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/delete/" + id;

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(id),
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

export function EditarCliente(req : any) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/editar";

  return new Promise((resolve, reject) => {
    fetch(BaseUrl, {
      method: "PUT",
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

export function ObtenerClienteByNroDoc(nro_doc : string) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/get_by_nrodoc?nro_doc=" + nro_doc;

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
