import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import type { CreateRestaurantInput, UpdateRestaurantInput } from './restaurants.schema';

export class RestaurantsService {
  async create(ownerId: string, data: CreateRestaurantInput) {
    // Check if slug already exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug: data.slug },
    });

    if (existingRestaurant) {
      throw new AppError(400, 'A restaurant with this slug already exists');
    }

    // Create restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        logoUrl: data.logoUrl,
        coverUrl: data.coverUrl,
        addressStreet: data.addressStreet,
        addressCity: data.addressCity,
        addressState: data.addressState,
        addressZip: data.addressZip,
        addressCountry: data.addressCountry || 'Brasil',
        phone: data.phone,
        email: data.email,
        currency: data.currency || 'BRL',
        operatingHours: data.operatingHours,
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return restaurant;
  }

  async findAll(ownerId?: string) {
    const where = ownerId ? { ownerId } : {};

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            menuItems: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return restaurants;
  }

  async findById(id: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            menuItems: true,
            orders: true,
          },
        },
      },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    return restaurant;
  }

  async findBySlug(slug: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    return restaurant;
  }

  async update(id: string, ownerId: string, data: UpdateRestaurantInput) {
    // Check if restaurant exists and belongs to owner
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    if (restaurant.ownerId !== ownerId) {
      throw new AppError(403, 'You do not have permission to update this restaurant');
    }

    // If slug is being updated, check if it's available
    if (data.slug && data.slug !== restaurant.slug) {
      const existingRestaurant = await prisma.restaurant.findUnique({
        where: { slug: data.slug },
      });

      if (existingRestaurant) {
        throw new AppError(400, 'A restaurant with this slug already exists');
      }
    }

    // Update restaurant
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return updatedRestaurant;
  }

  async delete(id: string, ownerId: string) {
    // Check if restaurant exists and belongs to owner
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    if (restaurant.ownerId !== ownerId) {
      throw new AppError(403, 'You do not have permission to delete this restaurant');
    }

    // Delete restaurant (cascade will delete related data)
    await prisma.restaurant.delete({
      where: { id },
    });

    return { message: 'Restaurant deleted successfully' };
  }

  async toggleActive(id: string, ownerId: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    if (restaurant.ownerId !== ownerId) {
      throw new AppError(403, 'You do not have permission to modify this restaurant');
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        isActive: !restaurant.isActive,
      },
    });

    return updatedRestaurant;
  }

  async toggleAcceptsOrders(id: string, ownerId: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    if (restaurant.ownerId !== ownerId) {
      throw new AppError(403, 'You do not have permission to modify this restaurant');
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        acceptsOrders: !restaurant.acceptsOrders,
      },
    });

    return updatedRestaurant;
  }
}
