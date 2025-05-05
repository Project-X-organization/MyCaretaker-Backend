const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cloudinary = require('../config/cloudinary');
const path = require('path');

exports.createProperty = async (req, res) => {
  try {
    const { title, description, annualRent, otherCharges, propertyType, location, bedrooms, bathrooms } =
      req.body;

      const platformFeePercentage = process.env.PLATFORM_FEE_PERCENTAGE || 0.08;

    // user data from the body of the request if the user is authenticated
    const userId = req.user.id;

    // upload images to cloudinary
    const images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Convert file buffer to base64 string
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64Image, {
          folder: 'properties', // Optional: Add folder for better organization
        });

        images.push(result.secure_url);
      }
    }

    // convert annualRent and otherCharges to numbers
    const rentAmount = parseFloat(annualRent);
    const extraCharges = parseFloat(otherCharges) || 0;

    // CALCULATE the platform fee of (8% of the annual rent)
    const platformFee = rentAmount * platformFeePercentage;

    // CALCULATE the total amount to be paid by the user
    const totalPrice = rentAmount + extraCharges + platformFee;


    const property = await prisma.property.create({
      data: {
        title,
        description,
        annualRent: rentAmount,
        otherCharges: extraCharges,
        platformFee,
        price: totalPrice,
        propertyType,
        location,
        images,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        userId: userId,
      },
    });

    res.status(201).json({
      message: 'Property created successfully',
      data: property,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Error creating property',
      error: error.message,
    });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const { search, sortBy = 'createdAt', sortOrder = 'asc', status } = req.query;
    const userId = req.user.id; // Get the user ID from the request
    const role = req.user.role; // Get the user role from the request
    console.log(req.user) 
    // List of valid fields to sort by
    const validSortFields = [
      'price',
      'bedroom',
      'createdAt',
      'updatedAt',
      'location',
      'title',
      'propertyType',
    ];
    if (!validSortFields.includes(sortBy)) {
      return res
        .status(400)
        .json({ message: `'${sortBy}' is not a valid sort field` });
    }

    // Build the query object for filtering
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role-based filtering
    if (role === 'admin') {
      // Admin can see all properties except deleted ones
      where.isDeleted = false;
      if (status) {
        where.status = status;
      }
    }else if(role === 'agent'){
      // Agent can see their own properties and approved ones
      where.agentId = userId,
      where.isDeleted = false;
      if(status) {
        where.status = status;
      }
    } else {
      // regular user can only see approved properties and not deleted ones
      where.status = 'approved';
      where.isDeleted = false;
    }
       

    // Fetch properties with filtering and sorting
    const properties = await prisma.property.findMany({
      where, // Filtering conditions
      orderBy: {
        [sortBy]: sortOrder.toLowerCase(), // Sorting field and order
      },
    });

    res.status(200).json({
      message: 'Properties retrieved successfully',
      data: properties,
    });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({
      message: 'Error retrieving properties',
      error: error.message,
    });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: id },
    });

    if (!property) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }

    res.status(200).json({
      message: 'Property retrieved successfully',
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving property',
      error: error.message,
    });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, annualRent, otherCharges, location, propertyType, bedrooms, bathrooms } = req.body;
    // const role = req.user.role
    // // CHECK IF THE USER IS AN AGENT OR ADMIN
    // if(role != 'agent' || role != 'admin'){
    //   return res.status(403).json({
    //     message: "someting" 
    //   })
    // }
    // check  if the property exists
    const propertyExists = await prisma.property.findUnique({
      where: { id: id },
    });
    // if the property does not exist throw an error
    if (!propertyExists) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }

    // convert annualRent and otherCharges to numbers
    const rentAmount = parseFloat(annualRent) || propertyExists.annualRent;
    const extraCharges = parseFloat(otherCharges) || propertyExists.otherCharges;

    // CALCULATE the platform fee of (8% of the annual rent)
    const platformFeePercentage = process.env.PLATFORM_FEE_PERCENTAGE || 0.08;

    const platformFee = rentAmount * platformFeePercentage;

    // CALCULATE the total amount to be paid by the user
    const totalPrice = rentAmount + extraCharges + platformFee;

    const property = await prisma.property.update({
      where: { id: id },
      data: {
        title,
        description,
        annualRent: rentAmount,
        otherCharges: extraCharges,
        platformFee,
        price: totalPrice,
        propertyType,
        location,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
      },
    });

    res.status(200).json({
      message: 'Property updated successfully',
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating property',
      error: error.message,
    });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.property.update({
      where: {id},
      data: { isDeleted: true, deletedAt: new Date() }
    })

    res.status(200).json({
      message: 'Property deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting property',
      error: error.message,
    });
  }
};


// ADMIN ROUTES
exports.changePropertyStatus = async (req, res) =>{
  try {
    const { id } = req.params;
    const { status } = req.query;
    const property = await prisma.property.update({
      where: { id },
      data: { status: status }
    });
    
    res.status(200).json({
      message: `Property ${status} successfully`,
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error approving property',
      error: error.message,
    })
  }
}