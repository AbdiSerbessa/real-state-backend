import { Request, Response } from "express";
import { db } from "../db/index.js";
import { properties, propertyImages } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getProperties = async (req: Request, res: Response) => {
  try {
    const { location, minPrice, maxPrice, bedrooms } = req.query;

    const allProperties = await db.query.properties.findMany({
      with: {
        images: true,
        landlord: {
          columns: { id: true, name: true, phone: true, email: true },
        },
      },
      where: (properties, { and, gte, lte, ilike }) => {
        const conditions = [];
        if (location) conditions.push(ilike(properties.location, `%${location}%`));
        if (minPrice) conditions.push(gte(properties.price, minPrice as string));
        if (maxPrice) conditions.push(lte(properties.price, maxPrice as string));
        if (bedrooms) conditions.push(eq(properties.bedrooms, Number(bedrooms)));
        return conditions.length > 0 ? and(...conditions) : undefined;
      },
    });

    res.json(allProperties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
};

export const createProperty = async (req: Request, res: Response) => {
  try {
    const { title, description, price, location, bedrooms, bathrooms, landlordId, imageUrls } = req.body;

    const [newProperty] = await db
      .insert(properties)
      .values({
        title,
        description,
        price,
        location,
        bedrooms,
        bathrooms,
        landlordId,
      })
      .returning();

    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      await db.insert(propertyImages).values(
        imageUrls.map((url: string) => ({
          propertyId: newProperty.id,
          imageUrl: url,
        }))
      );
    }

    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ error: "Failed to create property listing" });
  }
};