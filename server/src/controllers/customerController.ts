import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return res.json(customers);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar clientes' });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return res.status(404).json({ message: 'Cliente não encontrado' });
    return res.json(customer);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar cliente' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    // Validação básica (poderia usar Zod)
    if (!data.name || !data.document) {
        return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }

    const customer = await prisma.customer.create({ data });
    return res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao criar cliente' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Remove campos que não devem ser atualizados diretamente se existirem
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;

    const customer = await prisma.customer.update({
      where: { id },
      data
    });
    return res.json(customer);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar cliente' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao deletar cliente' });
  }
};