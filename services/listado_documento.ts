const API_CONTROLLER = "/api/factura";

export function ObtenerListadoDocumentos(campo1: string, fecha_desde: string, fecha_hasta: string, id_tipo_doc: number, limit: number, offset: number, estado: number) {
    const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
    let BaseUrl = base + API_CONTROLLER + "/search?campo1=" + campo1 + "&fecha_desde=" + fecha_desde +
        "&fecha_hasta=" + fecha_hasta + "&id_tipo_doc=" + id_tipo_doc + "&limit=" + limit + "&offset=" + offset + "&estado=" + estado;

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

export function ModificarEstadoDocumento(ruc_emisor: string, nro_documento: string, estado: number) {
    const base = process.env.NEXT_PUBLIC_API_ROOT_IIS;
    let BaseUrl = base + API_CONTROLLER + "/update_status?ruc_emisor=" + ruc_emisor + "&nro_documento=" + nro_documento +
        "&estado=" + estado;

    return new Promise((resolve, reject) => {
        fetch(BaseUrl, {
            method: "PUT",
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