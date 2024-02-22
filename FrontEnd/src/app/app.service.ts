import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class IP {  
  ipBackend: string = 'http://127.0.0.1:8080/api/v2/';
}