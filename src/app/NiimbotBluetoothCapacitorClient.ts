/// <reference types="cordova-plugin-ble-central" />

import {
    ConnectionInfo,
    NiimbotAbstractClient,
    ConnectResult,
    NiimbotPacket,
    ResponseCommandId,
    Utils,
    ConnectEvent,
    DisconnectEvent,
    PacketReceivedEvent,
    RawPacketReceivedEvent,
    RawPacketSentEvent,
  } from "@mmote/niimbluelib";
  
  // cordova-plugin-ble-central has no disconnect events
  export class NiimbotBluetoothCapacitorClient extends NiimbotAbstractClient {
    // private mac: string;
    private device: any;
  
    constructor(mac: string) {
      super();
      // this.mac = mac;
    }
  
    private async tryConnect(): Promise<void> {
      return new Promise(async (resolve, reject) => {
        const rawPacketReceivedWrapped = this.rawPacketReceived.bind(this);
    
        const devices = await ble.withPromises.bondedDevices();
        console.log('bondedDevices', devices);
        ble.scan([], 5 , async (data) => {
          if(data.name !== 'B1-G522072694') {
            return;
          }

          await ble.withPromises.stopScan();

          ble.connect(data.id, async (device: any) => {
            console.log('onConnect', device);
  
            localStorage.setItem('device', JSON.stringify(device));
            this.device = device;
            // ble.startNotification(this.device.id, "service_uuid", "characteristic_uuid", rawPacketReceivedWrapped, reject);

            resolve(this.device);
          }, reject);
        }, (error) => {
          reject(new Error("No device found"));
        });
      });
    }
  
    public async connect(): Promise<ConnectionInfo> {
      //check if device was previously connected, we need to disconnect it first
      try {
        this.device = JSON.parse(localStorage.getItem('device') as string);
      } catch(e) {}

      await this.disconnect();
      await this.tryConnect();
  
      try {
        await this.initialNegotiate();
        await this.fetchPrinterInfo();
      } catch (e) {
        console.error("Unable to fetch printer info.");
        console.error(e);
      }
  
      const result: ConnectionInfo = {
        deviceName: `Bluetooth (${this.device.id})`,
        result: this.info.connectResult ?? ConnectResult.FirmwareErrors,
      };
  
      this.emit("connect", new ConnectEvent(result));
  
      return result;
    }
  
    private rawPacketReceived(buffer: ArrayBuffer) {
      if (buffer.byteLength === 0) {
        return;
      }
  
      const data = new Uint8Array(buffer);
      const packet = NiimbotPacket.fromBytes(data);
  
      this.emit("rawpacketreceived", new RawPacketReceivedEvent(data));
      this.emit("packetreceived", new PacketReceivedEvent(packet));
  
      if (!(packet.command in ResponseCommandId)) {
        console.warn(`Unknown response command: 0x${Utils.numberToHex(packet.command)}`);
      }
    }
  
    public isConnected(): boolean {
      return this.device !== undefined;
    }
  
    public async disconnect() {
      this.stopHeartbeat();
  
      if (this.device) {
        ble.disconnect(this.device.id, () => {
          this.emit("disconnect", new DisconnectEvent());
        }, (err) => {
          console.error("Error during disconnect", err);
        });
        this.device = undefined;
      }
    }
  
    public async sendPacketWaitResponse(packet: NiimbotPacket, timeoutMs?: number): Promise<NiimbotPacket> {
      await this.sendPacket(packet, true);
  
      if (packet.oneWay) {
        return new NiimbotPacket(ResponseCommandId.Invalid, []);
      }
  
      return new Promise((resolve, reject) => {
        let timeout: number | undefined = undefined;
  
        const listener = (evt: PacketReceivedEvent) => {
          if (
            packet.validResponseIds.length === 0 ||
            packet.validResponseIds.includes(evt.packet.command as ResponseCommandId)
          ) {
            clearTimeout(timeout);
            this.removeListener("packetreceived", listener);
            resolve(evt.packet);
          }
        };
  
        timeout = window.setTimeout(() => {
          this.removeListener("packetreceived", listener);
          reject(new Error(`Timeout waiting response (waited for ${Utils.bufToHex(packet.validResponseIds, ", ")})`));
        }, timeoutMs ?? 1000);
  
        this.addListener("packetreceived", listener);
      });
    }
  
    public async sendRaw(data: Uint8Array, force?: boolean) {
      const send = async () => {
        if (!this.isConnected()) {
          this.disconnect();
          throw new Error("Disconnected");
        }
  
        await Utils.sleep(this.packetIntervalMs);
  
        ble.write(this.device.id, "service_uuid", "characteristic_uuid", data.buffer, () => {
          this.emit("rawpacketsent", new RawPacketSentEvent(data));
        }, (err) => {
          throw err;
        });
      };
  
      if (force) {
        await send();
      } else {
        await send();
      }
    }
  }