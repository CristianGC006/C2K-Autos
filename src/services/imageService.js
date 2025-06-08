// Servicio para gestionar imágenes de vehículos
export const imageService = {
  // Mapeo de imágenes por marca y modelo usando Unsplash y otras fuentes
  vehicleImages: {
    // Chevrolet
    'chevrolet-camaro': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    'chevrolet-corvette': 'https://images.unsplash.com/photo-1544829728-0a3ada110a72?w=800&q=80',
    'chevrolet-cruze': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    'chevrolet-silverado': 'https://images.unsplash.com/photo-1563720223420-50ae60300165?w=800&q=80',
    
    // Ford
    'ford-mustang': 'https://images.unsplash.com/photo-1584345604476-6cc67b5cb6f3?w=800&q=80',
    'ford-f150': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
    'ford-explorer': 'https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=800&q=80',
    'ford-escape': 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&q=80',
    
    // BMW
    'bmw-x5': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    'bmw-x3': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80',
    'bmw-serie3': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80',
    'bmw-serie5': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80',
    
    // Audi
    'audi-a4': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    'audi-q7': 'https://images.unsplash.com/photo-1544829728-0a3ada110a72?w=800&q=80',
    'audi-a3': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    
    // Mercedes
    'mercedes-clase-c': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    'mercedes-glc': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    'mercedes-clase-e': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    
    // Toyota
    'toyota-camry': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    'toyota-corolla': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    'toyota-rav4': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    
    // Honda
    'honda-civic': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
    'honda-accord': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
    'honda-crv': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
    
    // Nissan
    'nissan-altima': 'https://images.unsplash.com/photo-1574782228741-1e0a4c9d4c12?w=800&q=80',
    'nissan-sentra': 'https://images.unsplash.com/photo-1574782228741-1e0a4c9d4c12?w=800&q=80',
    'nissan-rogue': 'https://images.unsplash.com/photo-1574782228741-1e0a4c9d4c12?w=800&q=80',
    
    // Dodge
    'dodge-charger': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    'dodge-challenger': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    'dodge-durango': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'
  },

  // Imagen por defecto
  defaultImage: 'https://images.unsplash.com/photo-1494976688930-2a42c9e4b5e5?w=800&q=80',
  // Función para obtener imagen por marca y modelo
  getVehicleImage(brand, model) {
    // Verificar si brand y model son válidos (no nulos, undefined o vacíos)
    if (!brand || !model || brand === null || model === null || 
        typeof brand !== 'string' || typeof model !== 'string') {
      console.warn('Brand o model inválido:', { brand, model });
      return this.defaultImage;
    }
    
    try {
      // Normalizar los nombres para el mapeo con validación extra
      const normalizedBrand = String(brand).toLowerCase().trim();
      const normalizedModel = String(model).toLowerCase().trim().replace(/\s+/g, '-');
      const key = `${normalizedBrand}-${normalizedModel}`;
      
      
      
      return this.vehicleImages[key] || this.getImageByBrand(normalizedBrand) || this.defaultImage;
    } catch (error) {
      console.error('Error en getVehicleImage:', error, { brand, model });
      return this.defaultImage;
    }
  },
  // Función de fallback por marca
  getImageByBrand(brand) {
    // Verificar si brand es válido
    if (!brand || brand === null || typeof brand !== 'string') {
      console.warn('Brand inválido en getImageByBrand:', brand);
      return this.defaultImage;
    }
    
    try {
      const brandDefaults = {
        'chevrolet': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
        'ford': 'https://images.unsplash.com/photo-1584345604476-6cc67b5cb6f3?w=800&q=80',
        'bmw': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
        'audi': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
        'mercedes': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
        'toyota': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
        'honda': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
        'nissan': 'https://images.unsplash.com/photo-1574782228741-1e0a4c9d4c12?w=800&q=80',
        'dodge': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'
      };
      
      const normalizedBrand = String(brand).toLowerCase().trim();
      return brandDefaults[normalizedBrand] || this.defaultImage;
    } catch (error) {
      console.error('Error en getImageByBrand:', error, { brand });
      return this.defaultImage;
    }
  },

  // Función para verificar si una imagen se carga correctamente
  async checkImageLoad(imageUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageUrl;
      
      // Timeout de 5 segundos
      setTimeout(() => resolve(false), 5000);
    });
  },
  // Función para obtener imagen con verificación de carga
  async getValidatedImage(brand, model, fallbackUrl = null) {
    try {
      // Verificar primero que brand y model sean válidos
      if (!brand || !model || brand === null || model === null || 
          typeof brand !== 'string' || typeof model !== 'string') {
        console.warn('Parámetros inválidos en getValidatedImage:', { brand, model, fallbackUrl });
        return this.defaultImage;
      }
      
      const primaryUrl = fallbackUrl || this.getVehicleImage(brand, model);
      
      const isValid = await this.checkImageLoad(primaryUrl);
      if (isValid) {
        return primaryUrl;
      }
      
      // Si la imagen primaria falla, probar con la imagen por marca
      const brandUrl = this.getImageByBrand(brand);
      if (brandUrl && brandUrl !== this.defaultImage) {
        const isBrandValid = await this.checkImageLoad(brandUrl);
        if (isBrandValid) {
          return brandUrl;
        }
      }
      
      // Último recurso: imagen por defecto
      return this.defaultImage;
    } catch (error) {
      console.error('Error en getValidatedImage:', error, { brand, model, fallbackUrl });
      return this.defaultImage;
    }
  }
};
