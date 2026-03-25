import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useCartStore = defineStore('cart', () => {
    
// ---- Ensure Products List is Empty-----
    const products = ref([]);


//  ---- Shopping Cart ----

    const savedCart = localStorage.getItem('my_cart');
    const cart = ref(savedCart ? JSON.parse(savedCart) : []);
    
// ---- Stringify the New Cart and Storage ----

    watch(cart, (newCart) => {
        localStorage.setItem('my_cart', JSON.stringify(newCart));
    }, { deep: true});


// ---- Compute Total Price ----

    const totalPrice = computed(() => {
        return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0);        
    });

    const cartCount = computed(() => {
        return cart.value.reduce((sum, item) => sum + item.quantity, 0);
    });


// ---- Add to Cart Function ----

    const addToCart = (product) => {
        if (product.stock > 0) {
            product.stock--;
            const cartItem = cart.value.find((c) => c.id === product.id);
            if(cartItem){
                cartItem.quantity++;
            }else {
                cart.value.push({ ...product, quantity: 1});
            }
        }
    };

// ---- Single Item Remove From Cart ----

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


// ---- Fetch Data from API and Assign the Stock Property to Each Item ----

    const fetchProducts = async () => {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
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
        removeFromCart,
        clearCart
    };
});