import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";

const MensWear = () => {
    const [products, setProducts] = useState([]);
    const [checkoutProduct, setCheckoutProduct] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        const dbRef = ref(database, "products");
        onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const mensProducts = Object.entries(data)
                    .map(([id, item]) => ({ id, ...item }))
                    .filter((item) => item.category === "mens-wear");
                setProducts(mensProducts);
            } else {
                setProducts([]);
            }
        });
    }, []);

    const handleBuyClick = (product) => {
        setCheckoutProduct(product);
    };

    return (
        <section
            style={{
                backgroundColor: "#000",
                minHeight: "100vh",
                padding: "60px 20px",
                fontFamily: "'Poppins', sans-serif",
                color: "#e0e7ff",
            }}
        >
            <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
                <h1
                    style={{
                        fontSize: "36px",
                        fontWeight: "700",
                        marginBottom: "24px",
                        color: "#a7f3d0",
                    }}
                >
                    Men's Wear
                </h1>
                <p style={{ fontSize: "18px", color: "#94a3b8", marginBottom: "50px" }}>
                    Explore our exclusive collection of men's fashion.
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "30px",
                    maxWidth: "1000px",
                    margin: "0 auto",
                }}
            >
                {products.map((product, idx) => (
                    <div
                        key={product.id}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{
                            position: "relative",
                            backgroundColor: "#1f2937",
                            borderRadius: "20px",
                            overflow: "hidden",
                            boxShadow:
                                hoveredIndex === idx
                                    ? "0 15px 40px rgba(52, 211, 153, 0.6)"
                                    : "0 10px 30px rgba(52, 211, 153, 0.3)",
                            cursor: "pointer",
                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                            transform: hoveredIndex === idx ? "scale(1.05)" : "scale(1)",
                            color: "#e0e7ff",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            height: "100%",
                        }}
                    >
                        <img
                            src={product.image}
                            alt={product.title}
                            style={{ width: "100%", height: "200px", objectFit: "cover" }}
                            loading="lazy"
                        />

                        <div style={{ padding: "20px" }}>
                            <h2
                                style={{
                                    fontSize: "22px",
                                    marginBottom: "8px",
                                    color: "#a7f3d0",
                                    fontWeight: "700",
                                }}
                            >
                                {product.title}
                            </h2>
                            <p style={{ fontSize: "16px", color: "#94a3b8", marginBottom: "6px" }}>
                                {product.brand}
                            </p>
                            <p style={{ fontSize: "18px", fontWeight: "bold", color: "#34d399" }}>
                                ₹{product.price}
                            </p>

                            {/* Buy Now Button */}
                            <button
                                onClick={() => handleBuyClick(product)}
                                style={{
                                    marginTop: "15px",
                                    backgroundColor: "#22c55e",
                                    color: "black",
                                    padding: "12px 0",
                                    border: "none",
                                    width: "100%",
                                    borderRadius: "9999px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    fontWeight: "700",
                                    boxShadow: "0 6px 12px rgba(34, 197, 94, 0.6)",
                                    transition: "background-color 0.3s ease",
                                }}
                                onMouseEnter={(e) => (e.target.style.backgroundColor = "#16a34a")}
                                onMouseLeave={(e) => (e.target.style.backgroundColor = "#22c55e")}
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Checkout Modal */}
            {checkoutProduct && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                    onClick={() => setCheckoutProduct(null)}
                >
                    <div
                        style={{
                            backgroundColor: "#111827",
                            padding: "30px",
                            borderRadius: "20px",
                            minWidth: "320px",
                            textAlign: "center",
                            boxShadow: "0 8px 24px rgba(34, 197, 94, 0.8)",
                            color: "#d1fae5",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2
                            style={{
                                fontSize: "26px",
                                fontWeight: "bold",
                                marginBottom: "12px",
                                color: "#22c55e",
                            }}
                        >
                            Confirm Purchase
                        </h2>
                        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
                            Proceed with payment for{" "}
                            <strong style={{ color: "#86efac" }}>{checkoutProduct.title}</strong>
                        </p>
                        <button
                            onClick={() => setCheckoutProduct(null)}
                            style={{
                                marginTop: "10px",
                                backgroundColor: "#dc2626",
                                color: "white",
                                padding: "12px 24px",
                                border: "none",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontSize: "16px",
                                fontWeight: "bold",
                                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.8)",
                                transition: "background-color 0.3s ease",
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "#b91c1c")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "#dc2626")}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default MensWear;
