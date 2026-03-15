import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os produtos
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, supplier: true },
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
};

// Buscar produto por ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true },
    });
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
};

// Criar produto
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, description, price, costPrice, stock, minStock, unit, isActive } = req.body;

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) return res.status(400).json({ message: `SKU "${sku}" já está em uso` });

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        price,
        costPrice,
        stock: stock || 0,
        minStock: minStock || 0,
        unit: unit || 'UN',
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
};

// Atualizar produto
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sku, description, price, costPrice, stock, minStock, unit, isActive } = req.body;

    const existing = await prisma.product.findFirst({ where: { sku, NOT: { id } } });
    if (existing) return res.status(400).json({ message: `SKU "${sku}" já está em uso` });

    const product = await prisma.product.update({
      where: { id },
      data: { name, sku, description, price, costPrice, stock, minStock, unit, isActive },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
};

// Deletar produto
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    res.json({ message: 'Produto desativado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar produto' });
  }
};