import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Usuário inativo' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // Retorna dados compatíveis com UserSession do frontend
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        email: user.email
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ 
        where: { id: req.user?.id },
        select: { id: true, name: true, username: true, role: true, email: true }
    });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
};