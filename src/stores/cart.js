import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useCartStore = defineStore('cart', () => {

// ---- Products List ----
    const products = ref([]);


// ---- Shopping Cart ----

    const savedCart = localStorage.getItem('my_cart');
    const cart = ref(savedCart ? JSON.parse(savedCart) : []);

// ---- Stringify the New Cart and Store ----

    watch(cart, (newCart) => {
        localStorage.setItem('my_cart', JSON.stringify(newCart));
    }, { deep: true });


// ---- Compute Total Price ----

    const totalPrice = computed(() => {
        return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
    });

    const cartCount = computed(() => {
        return cart.value.reduce((sum, item) => sum + item.quantity, 0);
    });


// ---- Category Filter (shared across all components) ----

    const selectedCategory = ref('Home');

    const categories = computed(() => {
        const list = products.value.map(p => p.category);
        return [...new Set(list)];
    });

    const setCategory = (cat) => {
        selectedCategory.value = cat;
        searchQuery.value = '';
    };

// ---- Flag to signal navigation back to HomePage ----
    const goingHome = ref(false);

    const goHome = () => {
        goingHome.value = true;
        selectedCategory.value = 'Home';
        searchQuery.value = '';
    };

// ---- Search Query (shared across all components) ----

    const searchQuery = ref('');

// ---- Filtered Products ----

    const filteredProducts = computed(() => {
        return products.value.filter(p => {
            const title = p.title || '';
            const name = p.name || '';
            const matchName = title.toLowerCase().includes(searchQuery.value.toLowerCase()) || name.toLowerCase().includes(searchQuery.value.toLowerCase());
            const matchCategory = selectedCategory.value === 'All' || selectedCategory.value === 'Home' || p.category === selectedCategory.value;
            return matchName && matchCategory;
        });
    });


// ---- Add to Cart ----

    const addToCart = (product) => {
        if (product.stock > 0) {
            product.stock--;
            const cartItem = cart.value.find((c) => c.id === product.id);
            if (cartItem) {
                cartItem.quantity++;
            } else {
                cart.value.push({ ...product, quantity: 1 });
            }
        }
    };

// ---- Remove a Single Item From Cart (by object) ----

    const removeItem = (item) => {
        const index = cart.value.findIndex((c) => c.id === item.id);
        if (index !== -1) {
            const product = products.value.find((p) => p.id === item.id);
            if (product) {
                product.stock += cart.value[index].quantity;
            }
            cart.value.splice(index, 1);
        }
    };

// ---- Decrease Qty, Remove Item if Qty Reaches 0 ----

    const decreaseQty = (item) => {
        const cartItem = cart.value.find((c) => c.id === item.id);
        if (!cartItem) return;
        if (cartItem.quantity > 1) {
            cartItem.quantity--;
            const product = products.value.find((p) => p.id === item.id);
            if (product) product.stock++;
        } else {
            removeItem(cartItem);
        }
    };

// ---- Increase Qty ----

    const increaseQty = (item) => {
        const cartItem = cart.value.find((c) => c.id === item.id);
        if (!cartItem) return;
        const product = products.value.find((p) => p.id === item.id);
        if (product && product.stock > 0) {
            cartItem.quantity++;
            product.stock--;
        }
    };

// ---- Single Item Remove From Cart (by index, kept for compatibility) ----

    const removeFromCart = (index) => {
        const item = cart.value[index];
        const product = products.value.find((p) => p.id === item.id);
        if (product) {
            product.stock += item.quantity;
        }
        cart.value.splice(index, 1);
    };

// ---- Clear All Items In Cart ----

    const clearCart = () => {
        cart.value.forEach(item => {
            const product = products.value.find(p => p.id === item.id);
            if (product) {
                product.stock += item.quantity;
            }
        });
        cart.value = [];
    };

// ---- Fetch Data from API ----

    const fetchProducts = async () => {
        try {
            const response = await fetch('/Vue-products/api/Products.json');
            const data = await response.json();
            products.value = data.map(item => ({ ...item, stock: 5 }));
        } catch (error) {
            console.error('data fetching failed', error);
        }
    };

    return {
        products,
        fetchProducts,
        cart,
        totalPrice,
        cartCount,
        addToCart,
        removeItem,
        removeFromCart,
        decreaseQty,
        increaseQty,
        clearCart,
        selectedCategory,
        categories,
        setCategory,
        goingHome,
        goHome,
        searchQuery,
        filteredProducts,
    };
});