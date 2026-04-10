import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { debounce } from 'lodash-es';

export interface Product {
    id: number | string;
    title?: string;
    name?: string;
    price: number;
    category: string;
    stock: number;
    img: string;
    color?: string;
    colors?: { name: string; hex: string }[];
    sizes?: string[];
    description: string;
    material: string;
}

interface CartItem extends Product {
    quantity: number;
}

export const useCartStore = defineStore('cart', () => {

    // ---- Fetch Data from API ----

    const fetchProducts = async () => {
        isLoading.value = true;
        apiError.value = null;
        
        // https://69d3044a336103955f8e82e7.mockapi.io/api/v1/products 這個是網路API
        try {
            const response = await fetch('https://69d3044a336103955f8e82e7.mockapi.io/api/v1/products');
            if (!response.ok) {
            throw new Error(`Server error：${response.status}`);
            }
            const data = await response.json();
            products.value = data.map((item: Product) => ({ ...item, stock: 5 }));
        } catch (error) {
            apiError.value = "Product load failed. Retry later."; 
            console.error('data fetching failed', error);
        } finally {
        isLoading.value = false;
        }
    };

// ---- Products List ----
    const products = ref<Product[]>([]);
    const isLoading = ref<boolean>(false);
    const apiError = ref<string | null>(null);

    const toast = ref<{show: boolean; message: string}>({
        show: false,
        message: ''
    });

    const showToast = (msg: string) => {
        toast.value.show = true;
        toast.value.message = msg;
        
        setTimeout(() => {
            toast.value.show = false;
        }, 2000);
    };


// ---- Shopping Cart ----

    const savedCart = localStorage.getItem('my_cart');
    const cart = ref<CartItem[]>(savedCart ? JSON.parse(savedCart) : []);

// ---- Stringify the New Cart and Store ----

    watch(cart, (newCart) => {
        localStorage.setItem('my_cart', JSON.stringify(newCart));
    }, { deep: true });


// ---- Compute Total Price ----

    const totalPrice = computed<number>(() => {
        return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
    });

    const cartCount = computed<number>(() => {
        return cart.value.reduce((sum, item) => sum + item.quantity, 0);
    });


// ---- Category Filter (shared across all components) ----

    const selectedCategory = ref('Home');

    const categories = computed(() => {
        const list = products.value.map(p => p.category);
        return [...new Set(list)];
    });

    const searchQuery = ref('');

    const setCategory = (cat: string) => {
        selectedCategory.value = cat;
        searchQuery.value = '';
        goingHome.value = false;
    };

// ---- Flag to signal navigation back to HomePage ----
    const goingHome = ref(false);

    const goHome = () => {
        goingHome.value = true;
        selectedCategory.value = 'Home';
        searchQuery.value = '';
    };

// ---- Search Query (shared across all components) ----


    const tempInput = ref('');

    const updateSearch = debounce((newValue: string) => {
        searchQuery.value = newValue;
    }, 500);

    watch(tempInput, (newVal) => {
        updateSearch(newVal);
    });

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

    const addToCart = (product: Product) => {
        if (product.stock > 0) {
            product.stock--;
            const cartItem = cart.value.find((c) => c.id === product.id);
            if (cartItem) {
                cartItem.quantity++;
            } else {
                cart.value.push({ ...product, quantity: 1 });
            }

            const displayName = product.title || product.name || 'Item';
            showToast(`${displayName} added to cart!`);
        }
    };
    

// ---- Remove a Single Item From Cart (by object) ----

    const removeItem = (item: CartItem) => {
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

    const decreaseQty = (item: CartItem) => {
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

    const increaseQty = (item: CartItem) => {
        const cartItem = cart.value.find((c) => c.id === item.id);
        if (!cartItem) return;
        const product = products.value.find((p) => p.id === item.id);
        if (product && product.stock > 0) {
            cartItem.quantity++;
            product.stock--;
        }
    };

// ---- Single Item Remove From Cart (by index, kept for compatibility) ----

    const removeFromCart = (index: number) => {
        const item = cart.value[index];
        const product = products.value.find((p) => p.id === item.id);
        if (product) {
            product.stock += item.quantity;
        }
        cart.value.splice(index, 1);
    };

// ---- Clear All Items In Cart ----

    const clearCart = () => {
        cart.value.forEach((item: CartItem) => {
            const product = products.value.find(p => p.id === item.id);
            if (product) {
                product.stock += item.quantity;
            }
        });
        cart.value = [];
    };



    return {
        isLoading,
        apiError,
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
        toast,
        tempInput
    };
});