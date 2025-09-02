import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { Product, Store, CartItem } from "../types";

export const useStore = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products
  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  // Fetch user-specific data when user changes
  useEffect(() => {
    if (user) {
      const skipAuth = localStorage.getItem("skipAuth");
      if (skipAuth !== "true") {
        fetchCart();
        fetchWishlist();
      } else {
        setCart([]);
        setWishlist([]);
      }
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          stores (
            name,
            address
          )
        `
        )
        .eq("is_active", true);

      if (error) throw error;

      const formattedProducts: Product[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        image: item.images?.[0] || "",
        images: item.images || [],
        storeId: item.store_id,
        category: item.category || "",
        isActive: item.is_active,
        stock: item.stock || 0,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      const formattedStores: Store[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        images: item.images || [],
        address: item.address,
        ownerId: item.owner_id,
        coordinates: item.coordinates
          ? [item.coordinates.x, item.coordinates.y]
          : [0, 0],
        isActive: item.is_active,
        createdAt: new Date(item.created_at),
      }));

      setStores(formattedStores);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchCart = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(*)")
        .eq("user_id", user.id);

      if (error) throw error;

      const formattedCart: CartItem[] = data.map((item) => ({
        product: {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description || "",
          price: item.products.price,
          image: item.products.images?.[0] || "",
          images: item.products.images || [],
          storeId: item.products.store_id,
          category: item.products.category || "",
          isActive: item.products.is_active,
          stock: item.products.stock || 0,
        },
        quantity: item.quantity,
      }));

      setCart(formattedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setWishlist(data.map((item) => item.product_id));
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const createStore = async (storeData: Omit<Store, "id" | "createdAt">) => {
    if (!user) throw new Error("User must be authenticated to create a store");

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("stores")
        .insert({
          name: storeData.name,
          description: storeData.description,
          images: storeData.images || [],
          address: storeData.address,
          owner_id: user.id,
          coordinates: `(${storeData.coordinates[0]},${storeData.coordinates[1]})`,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newStore: Store = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        images: data.images || [],
        address: data.address,
        ownerId: data.owner_id,
        coordinates: data.coordinates
          ? [data.coordinates.x, data.coordinates.y]
          : [0, 0],
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
      };

      setStores((prev) => [...prev, newStore]);
      return newStore;
    } catch (error) {
      console.error("Error creating store:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // El bucket debe ser creado manualmente en el panel de Supabase
  const checkBucketAccess = async (bucketName: string): Promise<void> => {
    try {
      // Intentar listar archivos para verificar acceso
      const { error } = await supabase.storage
        .from(bucketName)
        .list();

      if (error) {
        console.error('Error accessing bucket:', error);
        throw new Error('No se puede acceder al almacenamiento. Por favor, contacta al administrador.');
      }
    } catch (error) {
      console.error('Error checking bucket access:', error);
      throw error;
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not compress image'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.7
          );
        };
        img.onerror = () => {
          reject(new Error('Error loading image'));
        };
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
    });
  };

  const uploadProductImage = async (
    file: File,
    productId: string
  ): Promise<string> => {
    const BUCKET_NAME = 'products'; // Usar el nombre del bucket ya creado en Supabase
    const fileExt = file.name.split(".").pop();
    const fileName = `${productId}/${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    try {
      // Verificar acceso al bucket
      await checkBucketAccess(BUCKET_NAME);

      // Validar el tipo y tamaño del archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }

      if (file.size > 5242880) { // 5MB
        throw new Error('El archivo no debe superar los 5MB');
      }

      // Convertir la imagen a un formato más pequeño si es necesario
      let fileToUpload = file;
      if (file.size > 1048576) { // Si es mayor a 1MB
        try {
          const compressedFile = await compressImage(file);
          fileToUpload = compressedFile;
        } catch (error) {
          console.warn('Error compressing image:', error);
          // Continuar con el archivo original si falla la compresión
        }
      }

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`product-images/${fileName}`, fileToUpload, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`product-images/${fileName}`);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const createProduct = async (
    productData: Omit<Product, "id" | "isActive">,
    imageFiles?: File[]
  ) => {
    if (!user)
      throw new Error("User must be authenticated to create a product");

    setIsLoading(true);
    try {
      // Primero crear el producto sin imágenes
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          store_id: productData.storeId || null,
          user_id: user.id,
          category: productData.category,
          stock: productData.stock,
          images: [],
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Si hay archivos de imagen, subirlos
      let uploadedImageUrls: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        try {
          // Subir las imágenes en paralelo
          const uploadPromises = imageFiles.map((file) =>
            uploadProductImage(file, data.id)
          );
          uploadedImageUrls = await Promise.all(uploadPromises);

          // Actualizar el producto con las URLs de las imágenes
          const { error: updateError } = await supabase
            .from("products")
            .update({
              images: uploadedImageUrls,
            })
            .eq("id", data.id);

          if (updateError) throw updateError;
        } catch (error) {
          // Si hay error en la subida de imágenes, eliminar el producto
          await supabase
            .from("products")
            .delete()
            .eq("id", data.id);
          throw error;
        }
      }

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        price: data.price,
        image: data.images[0] || "",
        images: data.images || [],
        storeId: data.store_id || '',
        category: data.category || "",
        isActive: data.is_active,
        stock: data.stock || 0,
      };

      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) return;

    // Skip Supabase operations for demo user
    if (user.id === 'demo-user-id') {
      // Handle cart locally for demo user
      const existingItem = cart.find(item => item.product.id === product.id);
      if (existingItem) {
        setCart(prev => prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setCart(prev => [...prev, { product, quantity }]);
      }
      return;
    }
    try {
      const { error } = await supabase.from("cart_items").upsert({
        user_id: user.id,
        product_id: product.id,
        quantity,
      });

      if (error) throw error;

      await fetchCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;

      await fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;

      await fetchCart();
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) return;

    // Skip Supabase operations for demo user
    if (user.id === 'demo-user-id') {
      // Handle wishlist locally for demo user
      if (wishlist.includes(productId)) {
        setWishlist(prev => prev.filter(id => id !== productId));
      } else {
        setWishlist(prev => [...prev, productId]);
      }
      return;
    }

    try {
      if (wishlist.includes(productId)) {
        const { error } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("wishlist_items").insert({
          user_id: user.id,
          product_id: productId,
        });

        if (error) throw error;
      }

      await fetchWishlist();
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const getWishlistProducts = () => {
    return products.filter((product) => wishlist.includes(product.id));
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const updateUserProfile = async (updates: { address?: string; phone_number?: string; ci?: string; name?: string }) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? {
        ...prev,
        name: updates.name ?? prev.name,
        address: updates.address ?? prev.address,
        phoneNumber: updates.phone_number ?? prev.phoneNumber,
        ci: updates.ci ?? prev.ci
      } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return {
    products,
    stores,
    cart,
    wishlist,
    isLoading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleWishlist,
    getWishlistProducts,
    createStore,
    createProduct,
    getCartTotal,
    getCartItemCount,
    fetchProducts,
    fetchStores,
  };
};
