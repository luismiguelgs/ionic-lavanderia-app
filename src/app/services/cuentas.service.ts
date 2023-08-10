import { Injectable } from '@angular/core';
import { Cuenta, CuentaData } from '../models/cuenta.model';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Ubicacion } from '../models/ubicacion.model';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CuentasService
{
    private _cuentas = new BehaviorSubject<Cuenta[]>([]);
    private  url = environment.firebaseConfig.databaseURL;
    //private url = environment.api;

    get cuentas()
    {
        return this._cuentas.asObservable();
    }
  
    constructor(private http: HttpClient) { }

    fetchItems()
    {
        return this.http.get<{[key:string]: CuentaData}>(this.url + '/clientes.json').pipe(
            take(1),
            map(resData => {
                const items = [];
                for(const key in resData)
                {
                  if(resData.hasOwnProperty(key))
                  {
                    items.push(new Cuenta(
                      key,
                      resData[key].nombre,
                      resData[key].apellido,
                      resData[key].telefono,
                      resData[key].email,
                      resData[key].direccion,
                      resData[key].distrito,
                      resData[key].ruc,
                      new Date(resData[key].creado),
                      new Date(resData[key].modificado),
                    ));
                  }
                }
                return items;
            }),
            tap(items => {
                this._cuentas.next(items);
            })
        );
    }
    addItem(item: Cuenta)
    {
        let id: string;
        let nuevaCuenta: Cuenta;
        nuevaCuenta = new Cuenta(
            null,
            item.nombre,
            item.apellido,
            item.telefono,
            item.email,
            item.direccion,
            item.distrito,
            item.ruc,
            new Date(),
            new Date()
        );
        return this.http.post<{id:string}>(this.url + '/clientes.json', {...nuevaCuenta}).pipe(
            take(1),
            switchMap(resData =>{
                id = resData.id;
                return this.cuentas;
            }),
            take(1),
            tap(cuentas => {
                nuevaCuenta.key = id;
                this._cuentas.next(cuentas.concat(nuevaCuenta));
            })
        );
    }
    updateItem(item: Cuenta)
    {
        let updatedItems: Cuenta[];
        return this.cuentas.pipe(
            take(1),
            switchMap(items => {
                const updatedItemIndex = items.findIndex(_item => _item.key === item.key);
                updatedItems = [...items];
                const oldItem = updatedItems[updatedItemIndex];
                updatedItems[updatedItemIndex] = new Cuenta(
                    item.key,
                    item.nombre,
                    item.apellido,
                    item.telefono,
                    item.email,
                    item.direccion,
                    item.distrito,
                    item.ruc,
                    item.creado,
                    new Date()
                );
                return this.http.put(`${this.url}/clientes/${item.key}.json`, {...updatedItems[updatedItemIndex], key:null});
            }),
            tap(() => {
                this._cuentas.next(updatedItems);
            })
        );
    }
    getItem(key: string)
    {
        return this.http.get<CuentaData>(this.url + `/clientes/${key}.json`).pipe(
            map(data=>{
                return new Cuenta(
                    key,
                    data.nombre,
                    data.apellido,
                    data.telefono,
                    data.email,
                    data.direccion,
                    data.distrito,
                    data.ruc,
                    new Date(data.creado),
                    new Date(data.modificado)
                );
            })
        );
    }
    deleteItem(id:string)
    {
        return this.http.delete(this.url + `/cuentas/${id}.json`).pipe(
            take(1),
            switchMap(() => {
                return this.cuentas
            }),
            take(1),
            tap(items =>{
                this._cuentas.next(items.filter(b => b.key !== id));
            })
        );
    }
}