const API_CONTROLLER = "/api/empresa";

interface Empresa {
  Nro_Ruc: string;
  Razon_Social: string;
  Serie_F: string;
  Serie_B: string;
  Serie_Fn: string;
  Serie_Bn: string;
  Igv: number;
  Icbper: number;
  Logo: string;
  Direccion: string;
  Telefono: string;
  Correo: string;
  Web: string;
  Departamento: string;
  Provincia: string;
  Distrito: string;
}

export function ObtenerEmpresaAll() {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER + "/get_all";

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

export function EliminarEmpresa(id: number) {
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

export function RegistrarEmpresa(req : Empresa) {
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

export function EditarEmpresa(req : Empresa) {
  const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
  let BaseUrl = base + API_CONTROLLER +"/editar";

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
