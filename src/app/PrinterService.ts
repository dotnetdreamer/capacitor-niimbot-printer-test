// printer.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, of, switchMap } from 'rxjs';
import { NiimbotBluetoothClient, NiimbotSerialClient, RequestCommandId, ResponseCommandId, Utils, HeartbeatData, NiimbotAbstractClient, PrinterInfo, PrinterModelMeta } from '@mmote/niimbluelib';

import {

  } from "@mmote/niimbluelib";
import { NiimbotBluetoothCapacitorClient } from './NiimbotBluetoothCapacitorClient';
  
@Injectable({
  providedIn: 'root'
})
export class PrinterService {
  private connectionState = new BehaviorSubject<any>('disconnected');
  private connectedPrinterName = new BehaviorSubject<string>('');
  private _printerClient = new BehaviorSubject<NiimbotAbstractClient | undefined>(undefined);
  private heartbeatData = new BehaviorSubject<HeartbeatData | undefined>(undefined);
  private printerInfo = new BehaviorSubject<PrinterInfo | undefined>(undefined);
  private printerMeta = new BehaviorSubject<PrinterModelMeta | undefined>(undefined);
  private heartbeatFails = new BehaviorSubject<number>(0);

  printerClient$ = this._printerClient.asObservable();

  constructor() {}

  getConnectionState() {
    return this.connectionState.asObservable();
  }

  getConnectedPrinterName() {
    return this.connectedPrinterName.asObservable();
  }

  getHeartbeatData() {
    return this.heartbeatData.asObservable();
  }

  getPrinterInfo() {
    return this.printerInfo.asObservable();
  }

  getPrinterMeta() {
    return this.printerMeta.asObservable();
  }

  getHeartbeatFails() {
    return this.heartbeatFails.asObservable();
  }

  initClient(connectionType: any) {
    console.log('initClient', connectionType);

    // let client: NiimbotAbstractClient | undefined;

    // this.printerClient$.pipe(
    //   filter(client => client !== undefined),
    //   switchMap(client => {
    //     if(client) {
    //       client.disconnect();
    //     }

    //     client = this._init();
    //     return of(client);
    //   }),
    // ).subscribe(client => {
    //   console.log('subscribed', client);
    // });


    this._init();
      

    // client.on('connect', (e) => {
    //   console.log('onConnect');
    //   this.heartbeatFails.next(0);
    //   this.connectionState.next('connected');
    //   this.connectedPrinterName.next(e.info.deviceName ?? 'unknown');
    // });

      // client.on('packetsent', (e) => {
      //   console.log(`>> ${Utils.bufToHex(e.packet.toBytes())} (${RequestCommandId[e.packet.command]})`);
      // });

      // client.on('packetreceived', (e) => {
      //   console.log(`<< ${Utils.bufToHex(e.packet.toBytes())} (${ResponseCommandId[e.packet.command]})`);
      // });

      // client.on('connect', (e) => {
      //   console.log('onConnect');
      //   this.heartbeatFails.next(0);
      //   this.connectionState.next('connected');
      //   this.connectedPrinterName.next(e.info.deviceName ?? 'unknown');
      // });

      // client.on('printerinfofetched', (e) => {
      //   console.log('printerInfoFetched');
      //   this.printerInfo.next(e.info);
      //   if (client) {
      //     this.printerMeta.next(client.getModelMetadata());
      //   }
      // });

      // client.on('disconnect', () => {
      //   console.log('onDisconnect');
      //   this.connectionState.next('disconnected');
      //   this.connectedPrinterName.next('');
      //   this.printerInfo.next(undefined);
      //   this.printerMeta.next(undefined);
      // });

      // client.on('heartbeat', (e) => {
      //   console.log('heartbeat', e.data);

      //   this.heartbeatFails.next(0);
      //   this.heartbeatData.next(e.data);
      // });

      // client.on('heartbeatfailed', (e) => {
      //   console.log('heartbeatFailed', e.failedAttempts); 
      //   const maxFails = 5;
      //   this.heartbeatFails.next(e.failedAttempts);

      //   console.warn(`Heartbeat failed ${e.failedAttempts}/${maxFails}`);
      //   if (e.failedAttempts >= maxFails) {
      //   //   Toasts.error(tr('connector.disconnect.heartbeat'));
      //     if (client) {
      //       client.disconnect();
      //     }
      //   }
      // });


    // this._printerClient.next(client);
  }

  private _init() {
    const client = new NiimbotBluetoothCapacitorClient("");
    client.connect();

    return client;
  }
}