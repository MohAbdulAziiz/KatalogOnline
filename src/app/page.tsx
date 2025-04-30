"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, DollarSign, X, Plus, Minus } from "lucide-react";
import Image from "next/image";


interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number; // ✅ Tambahkan kuota
}

interface CartItem extends Product {
  quantity: number;
}

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((response) => response.json())
      .then((data) => {
        const withStock = (data as Partial<Product>[]).map((item) => ({
          ...item,
          stock: Math.floor(Math.random() * 11), // stok 0–10
        })) as Product[];
        setProducts(withStock);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity < product.stock) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prevCart;
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const increaseQuantity = (productId: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getCartCount = () =>
    cart.reduce((acc, item) => acc + item.quantity, 0);

  const getTotalPrice = () =>
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!mounted) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center text-gradient bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-8">
        Katalog Produk
      </h1>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {products.map((product) => {
          const inCart = cart.find((item) => item.id === product.id);
          const availableStock =
            product.stock - (inCart?.quantity ?? 0);

          return (
            <div
              key={product.id}
              className="bg-white p-6 rounded-2xl shadow-lg border border-green-200 hover:scale-105 transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-500 hover:to-yellow-400"
            >
<Image
  src={product.image}
  alt={product.title}
  width={300}
  height={200}
  className="w-full h-32 object-contain mb-4 rounded-lg"
/>
              <h3 className="text-xl font-semibold text-gray-700">
                {product.title}
              </h3>
              <div className="flex items-center gap-1 mt-2 text-yellow-500">
                <DollarSign />
                <span>{product.price.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{product.description}</p>
              <p className="text-sm text-gray-800 mt-2">
                Kuota tersedia:{" "}
                <span className={availableStock === 0 ? "text-red-500" : "text-green-600"}>
                  {availableStock}
                </span>
              </p>
              <button
                onClick={() => addToCart(product)}
                disabled={availableStock === 0}
                className={`mt-4 w-full py-2 rounded-md transition text-white ${
                  availableStock === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-400 to-yellow-500 hover:from-teal-500 hover:to-yellow-400"
                }`}
              >
                <ShoppingCart className="inline mr-2" />
                Tambahkan ke Keranjang
              </button>
            </div>
          );
        })}
      </div>

      {/* Tombol Keranjang */}
      <div
        className="fixed bottom-4 right-4 p-4 bg-gradient-to-r from-teal-500 to-yellow-400 text-white rounded-full cursor-pointer hover:scale-105 transition-all duration-300 z-50"
        onClick={() => setShowCart(true)}
      >
        <ShoppingCart />
        <span className="ml-2">{getCartCount()}</span>
      </div>

      {/* Modal Cart */}
{showCart && (
  <div className="fixed inset-0 flex justify-center items-center z-50 pointer-events-none">
    <div className="bg-white w-full max-w-md max-h-[80vh] overflow-y-auto rounded-xl shadow-xl p-4 relative border border-gray-200 pointer-events-auto">
      {/* Tombol Tutup */}
      <button
        onClick={() => setShowCart(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
      >
        <X size={20} />
      </button>

      <h2 className="text-lg font-bold mb-3 text-center text-gray-800">🛒 Detail Keranjang</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-center">Keranjang masih kosong.</p>
      ) : (
        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-5 gap-2 bg-white border border-gray-200 rounded-lg p-3 shadow-sm items-center"
            >
<Image
  src={item.image}
  alt={item.title}
  width={48}
  height={48}
  className="col-span-1 w-12 h-12 object-contain rounded"
/>
              <div className="col-span-3">
                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity} x ${item.price.toFixed(2)} ={" "}
                  <span className="text-teal-600 font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </p>
                <p className="text-xs text-gray-400">Kuota: {item.stock}</p>
              </div>
              <div className="col-span-1 flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="bg-gray-200 hover:bg-gray-300 p-1 rounded-full"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs">{item.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(item.id)}
                    disabled={item.quantity >= item.stock}
                    className={`p-1 rounded-full ${
                      item.quantity >= item.stock
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 text-[10px]"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
            {cart.length > 0 && (
              <div className="mt-4 border-t pt-4 text-right">
                <p className="font-semibold text-gray-700">
                  Total:{" "}
                  <span className="text-teal-600 text-lg">
                    ${getTotalPrice().toFixed(2)}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Untuk menambah produk, silakan kembali ke Katalog Produk.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
