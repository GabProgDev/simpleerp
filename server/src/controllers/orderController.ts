import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os pedidos
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        items: { include: { product: true } },
        transactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedidos' });
  }
};

// Buscar pedido por ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        items: { include: { product: true } },
        transactions: true,
      },
    });
    if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedido' });
  }
};

// Criar pedido
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, userId, items, discount = 0, notes } = req.body;

    // Calcular total
    let total = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ message: `Produto ${item.productId} não encontrado` });
      if (product.stock < item.quantity) return res.status(400).json({ message: `Estoque insuficiente para ${product.name}` });
      const itemTotal = (product.price.toNumber() * item.quantity) - (item.discount || 0);
      total += itemTotal;
    }
    total -= discount;

    // Criar pedido com itens
    const order = await prisma.order.create({
      data: {
        customerId,
        userId,
        discount,
        total,
        notes,
        status: 'CONFIRMADO',
        items: {
          create: await Promise.all(items.map(async (item: any) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            const unitPrice = product!.price.toNumber();
            const itemTotal = (unitPrice * item.quantity) - (item.discount || 0);
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice,
              discount: item.discount || 0,
              total: itemTotal,
            };
          })),
        },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    // Baixar estoque
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'SAIDA',
          quantity: item.quantity,
          reason: `Venda #${order.number}`,
        },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar pedido' });
  }
};

// Finalizar venda (pagamento)
export const finalizeOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { method, userId } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });
    if (order.status === 'ENTREGUE') return res.status(400).json({ message: 'Pedido já finalizado' });

    // Atualizar status do pedido
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'ENTREGUE' },
    });

    // Criar transação financeira
    await prisma.transaction.create({
      data: {
        description: `Venda #${order.number}`,
        amount: order.total,
        type: 'RECEITA',
        status: 'PAGO',
        method,
        paidAt: new Date(),
        orderId: id,
        userId,
      },
    });

    res.json({ message: 'Venda finalizada com sucesso!', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao finalizar venda' });
  }
};

// Cancelar pedido
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });
    if (order.status === 'CANCELADO') return res.status(400).json({ message: 'Pedido já cancelado' });

    // Devolver estoque
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'ENTRADA',
          quantity: item.quantity,
          reason: `Cancelamento Venda #${order.number}`,
        },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });

    res.json({ message: 'Pedido cancelado', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cancelar pedido' });
  }
};