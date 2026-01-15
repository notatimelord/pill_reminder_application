import { Server } from 'socket.io';

let io: Server | null = null;

export function initSocket(server: any) {
  if (io) return;

  io = new Server(server, {
    cors: { origin: '*' }
  });


  io.on('connection', socket => {

    socket.on('emergency:start', payload => {
      io!.emit('emergency:start', payload);
    });

    socket.on('emergency:stop', payload => {
      io!.emit('emergency:stop', payload);
    });
  });
}

export function emitEmergencyStart(payload: { userId: number }) {
  if (!io) return;
  io.emit('emergency:start', payload);
}

export function emitEmergencyStop(payload: { userId: number }) {
  if (!io) return;
  io.emit('emergency:stop', payload);
}

export function emitScheduleUpdated(payload: {
  userId: number;
  date: string;
}) {
  if (!io) return;
  io.emit('schedule:updated', payload);
}

export function emitSettingsUpdated(payload: any) {
  if (!io) return;
  io.emit('settingsUpdated', payload);
}
