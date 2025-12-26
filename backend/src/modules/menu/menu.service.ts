import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from './menu.schema';

export class MenuService {
  // ============================================
  // MENU CATEGORIES
  // ============================================

  async createCategory(userId: string, data: CreateCategoryInput) {
    // Verify user owns the restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    if (restaurant.ownerId !== userId) {
      throw new AppError(403, 'You do not have permission to create categories for this restaurant');
    }

    const category = await prisma.menuCategory.create({
      data: {
        restaurantId: data.restaurantId,
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder,
      },
      include: {
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
    });

    return category;
  }

  async findCategoriesByRestaurant(restaurantId: string) {
    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId },
      include: {
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return categories;
  }

  async findCategoryById(id: string) {
    const category = await prisma.menuCategory.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    return category;
  }

  async updateCategory(id: string, userId: string, data: UpdateCategoryInput) {
    const category = await prisma.menuCategory.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    if (category.restaurant.ownerId !== userId) {
      throw new AppError(403, 'You do not have permission to update this category');
    }

    const updatedCategory = await prisma.menuCategory.update({
      where: { id },
      data,
    });

    return updatedCategory;
  }

  async deleteCategory(id: string, userId: string) {
    const category = await prisma.menuCategory.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    if (category.restaurant.ownerId !== userId) {
      throw new AppError(403, 'You do not have permission to delete this category');
    }

    await prisma.menuCategory.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }

  // ============================================
  // MENU ITEMS
  // ============================================

  async createMenuItem(userId: string, data: CreateMenuItemInput) {
    // Verify user owns the restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    if (restaurant.ownerId !== userId) {
      throw new AppError(403, 'You do not have permission to create menu items for this restaurant');
    }

    // If categoryId provided, verify it belongs to the restaurant
    if (data.categoryId) {
      const category = await prisma.menuCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category || category.restaurantId !== data.restaurantId) {
        throw new AppError(400, 'Invalid category for this restaurant');
      }
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: data.restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        price: data.price,
        calories: data.calories,
        allergens: data.allergens || [],
        stockQuantity: data.stockQuantity,
        customizations: data.customizations,
        displayOrder: data.displayOrder,
      },
      include: {
        category: true,
      },
    });

    return menuItem;
  }

  async findMenuItemsByRestaurant(restaurantId: string, includeUnavailable: boolean = false) {
    const where: any = { restaurantId };

    if (!includeUnavailable) {
      where.isAvailable = true;
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return menuItems;
  }

  async findMenuItemById(id: string) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!menuItem) {
      throw new AppError(404, 'Menu item not found');
    }

    return menuItem;
  }

  async updateMenuItem(id: string, userId: string, data: UpdateMenuItemInput) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!menuItem) {
      throw new AppError(404, 'Menu item not found');
    }

    if (menuItem.restaurant.ownerId !== userId) {
      throw new AppError(403, 'You do not have permission to update this menu item');
    }

    // If updating categoryId, verify it belongs to the same restaurant
    if (data.categoryId) {
      const category = await prisma.menuCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category || category.restaurantId !== menuItem.restaurantId) {
        throw new AppError(400, 'Invalid category for this restaurant');
      }
    }

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    return updatedMenuItem;
  }

  async deleteMenuItem(id: string, userId: string) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!menuItem) {
      throw new AppError(404, 'Menu item not found');
    }

    if (menuItem.restaurant.ownerId !== userId) {
      throw new AppError(403, 'You do not have permission to delete this menu item');
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    return { message: 'Menu item deleted successfully' };
  }

  async toggleAvailability(id: string, userId: string) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!menuItem) {
      throw new AppError(404, 'Menu item not found');
    }

    if (menuItem.restaurant.ownerId !== userId) {
      throw new AppError(403, 'You do not have permission to modify this menu item');
    }

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        isAvailable: !menuItem.isAvailable,
      },
    });

    return updatedMenuItem;
  }

  // Get full menu with categories and items
  async getFullMenu(restaurantId: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
      },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    const categories = await prisma.menuCategory.findMany({
      where: {
        restaurantId,
        isActive: true,
      },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return {
      restaurant,
      categories,
    };
  }
}
