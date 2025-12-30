import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { randomBytes } from 'crypto';
import type { CreateTableInput } from './tables.schema';

export class TablesService {
  // Criar mesa (só owner do restaurante)
  async createTable(userId: string, data: CreateTableInput) {
    // Verificar ownership do restaurante
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    });

    if (!restaurant || restaurant.ownerId !== userId) {
      throw new AppError(403, 'You do not have permission to create tables for this restaurant');
    }

    // Verificar se número da mesa já existe
    const existing = await prisma.table.findFirst({
      where: {
        restaurantId: data.restaurantId,
        number: data.number,
      },
    });

    if (existing) {
      throw new AppError(400, 'Table number already exists for this restaurant');
    }

    // Gerar QR code único
    const qrCode = `table_${data.restaurantId}_${data.number}_${randomBytes(8).toString('hex')}`;

    const table = await prisma.table.create({
      data: {
        restaurantId: data.restaurantId,
        number: data.number,
        capacity: data.capacity,
        qrCode,
      },
    });

    return table;
  }

  // Iniciar sessão (cliente escaneia QR)
  async startSession(tableId: string, userId: string) {
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        tableSessions: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!table) {
      throw new AppError(404, 'Table not found');
    }

    if (!table.isActive) {
      throw new AppError(400, 'Table is not active');
    }

    // Se já existe sessão ativa, adiciona como membro pendente
    if (table.tableSessions.length > 0) {
      const activeSession = table.tableSessions[0];

      // Verificar se já é membro
      const existingMember = await prisma.tableSessionMember.findFirst({
        where: {
          sessionId: activeSession.id,
          userId,
        },
      });

      if (existingMember) {
        return { session: activeSession, member: existingMember, isNew: false };
      }

      // Criar membro pendente
      const member = await prisma.tableSessionMember.create({
        data: {
          sessionId: activeSession.id,
          userId,
          role: 'MEMBER',
          status: 'PENDING',
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      return { session: activeSession, member, isNew: true, needsApproval: true };
    }

    // Criar nova sessão - primeiro usuário é o OWNER
    const session = await prisma.tableSession.create({
      data: {
        tableId,
        restaurantId: table.restaurantId,
        status: 'ACTIVE',
        members: {
          create: {
            userId,
            role: 'OWNER',
            status: 'APPROVED',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        table: true,
      },
    });

    return { session, member: session.members[0], isNew: true, isOwner: true };
  }

  // Aprovar membro
  async approveMember(sessionId: string, memberId: string, ownerId: string, approved: boolean) {
    // Verificar se quem aprova é o owner da sessão
    const ownerMember = await prisma.tableSessionMember.findFirst({
      where: {
        sessionId,
        userId: ownerId,
        role: 'OWNER',
      },
    });

    if (!ownerMember) {
      throw new AppError(403, 'Only the table owner can approve members');
    }

    const member = await prisma.tableSessionMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.sessionId !== sessionId) {
      throw new AppError(404, 'Member not found in this session');
    }

    if (member.status !== 'PENDING') {
      throw new AppError(400, 'Member is not pending approval');
    }

    const updatedMember = await prisma.tableSessionMember.update({
      where: { id: memberId },
      data: {
        status: approved ? 'APPROVED' : 'LEFT',
        leftAt: approved ? null : new Date(),
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return updatedMember;
  }

  // Obter sessão ativa da mesa
  async getActiveSession(tableId: string) {
    const session = await prisma.tableSession.findFirst({
      where: {
        tableId,
        status: 'ACTIVE',
      },
      include: {
        table: true,
        members: {
          where: {
            status: { in: ['APPROVED', 'PENDING'] },
          },
          include: {
            user: {
              select: { id: true, fullName: true, email: true, avatarUrl: true },
            },
          },
        },
        orders: {
          where: {
            status: { not: 'CANCELLED' },
          },
          include: {
            orderItems: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    });

    return session;
  }

  // Gerar QR de saída para membro que pagou
  async generateExitQr(sessionId: string, userId: string) {
    const member = await prisma.tableSessionMember.findFirst({
      where: {
        sessionId,
        userId,
        paymentStatus: 'PAID',
      },
    });

    if (!member) {
      throw new AppError(400, 'Member has not paid yet');
    }

    const exitQrCode = `exit_${sessionId}_${userId}_${randomBytes(8).toString('hex')}`;

    const updatedMember = await prisma.tableSessionMember.update({
      where: { id: member.id },
      data: { exitQrCode },
    });

    return { exitQrCode: updatedMember.exitQrCode };
  }

  // Fechar sessão
  async closeSession(sessionId: string, userId: string) {
    const ownerMember = await prisma.tableSessionMember.findFirst({
      where: {
        sessionId,
        userId,
        role: 'OWNER',
      },
    });

    // Também permitir staff do restaurante fechar
    if (!ownerMember) {
      const session = await prisma.tableSession.findUnique({
        where: { id: sessionId },
        include: { restaurant: true },
      });

      if (!session) {
        throw new AppError(404, 'Session not found');
      }

      const staff = await prisma.staff.findFirst({
        where: {
          restaurantId: session.restaurantId,
          userId,
          isActive: true,
        },
      });

      if (!staff) {
        throw new AppError(403, 'Only the table owner or restaurant staff can close the session');
      }
    }

    const closedSession = await prisma.tableSession.update({
      where: { id: sessionId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    return closedSession;
  }

  // Listar mesas do restaurante
  async listTables(restaurantId: string, userId: string) {
    // Verificar acesso
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    // Verificar se é owner ou staff
    const isOwner = restaurant.ownerId === userId;
    const staff = await prisma.staff.findFirst({
      where: { restaurantId, userId, isActive: true },
    });

    if (!isOwner && !staff) {
      throw new AppError(403, 'Access denied');
    }

    const tables = await prisma.table.findMany({
      where: { restaurantId },
      include: {
        tableSessions: {
          where: { status: 'ACTIVE' },
          include: {
            _count: {
              select: { members: true, orders: true },
            },
          },
        },
      },
      orderBy: { number: 'asc' },
    });

    return tables;
  }
}
