export class Cuenta {
    constructor(
        public key: string,
        public nombre: string,
        public apellido: string,
        public telefono: string,
        public email?: string,
        public direccion?: string,
        public distrito?: string,
        public ruc?: string,
        public creado?: Date,
        public modificado?: Date,
    ) {}
}
export interface CuentaData{
    nombre: string;
    apellido: string;
    telefono: string;
    email?: string;
    direccion?: string;
    distrito?: string;
    ruc?: string;
    creado?: Date;
    modificado?: Date;
}