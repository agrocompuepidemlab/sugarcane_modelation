import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class IP {  
  ipBackend: string = 'http://127.0.0.1:5000/api/v2/';
}
