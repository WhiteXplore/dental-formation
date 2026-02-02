// inventory.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: true })
@Injectable()
export class InventoryGateway {
  @WebSocketServer()
  server: Server;

  // Call this when inventory is updated
  emitInventoryUpdate(updatedInventory: any) {
    this.server.emit('inventory-updated', updatedInventory);
  }
}
