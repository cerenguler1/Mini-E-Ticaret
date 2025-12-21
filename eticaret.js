const productList = document.getElementById('product-list');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const totalPriceElement = document.getElementById('total-price');
const cartSidebar = document.getElementById('cart-sidebar');
const overlay = document.getElementById('overlay');
const checkoutBtn = document.querySelector('.checkout-btn');

let cart = []; // Sepet veritabanımız

// 1. API'den Ürünleri Çek
async function getProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.log("Hata:", error);
        productList.innerHTML = '<p>Ürünler yüklenirken bir hata oluştu.</p>';
    }
}

// 2. Ürünleri Ekrana Bas (TL Çevrimi ile)
function displayProducts(products) {
    productList.innerHTML = ''; 

    products.forEach(product => {
        // Fiyatı 35 ile çarpıp yuvarlıyoruz (Gerçekçi TL Görüntüsü)
        const adjustedPrice = Math.floor(product.price * 35); 

        const productCard = document.createElement('div');
        productCard.classList.add('card');

        // Tırnak işaretleri hatası olmasın diye replace kullandık
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h4>${product.title}</h4>
            <p class="price">${adjustedPrice} ₺</p>
            <button class="add-btn" onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${adjustedPrice}, '${product.image}')">
                Sepete Ekle
            </button>
        `;
        
        productList.appendChild(productCard);
    });
}

// 3. Sepete Ekleme Fonksiyonu
function addToCart(id, title, price, image) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, title, price, image, quantity: 1 });
    }

    updateCartUI();
    toggleCart(true); // Sepeti aç
}

// 4. Sepetten Silme Fonksiyonu
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

// 5. Sepet Arayüzünü Güncelle
function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.image}" alt="ürün">
            <div class="item-details">
                <h4>${item.title}</h4>
                <p>${item.price} ₺ x ${item.quantity}</p>
                <span class="remove-btn" onclick="removeFromCart(${item.id})">Kaldır</span>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    totalPriceElement.innerText = total.toLocaleString('tr-TR') + " ₺";
    cartCount.innerText = count;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Sepetin şu an boş.</p>';
    }
}

// 6. Sepeti Aç/Kapa
function toggleCart(forceOpen = false) {
    if(forceOpen) {
        cartSidebar.classList.add('active');
        overlay.classList.add('active');
    } else {
        cartSidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// 7. Satın Al Butonu ve Animasyon (SweetAlert2)
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sepetiniz Boş!',
            text: 'Lütfen önce sepete ürün ekleyin.',
            confirmButtonColor: '#ff6b6b'
        });
        return;
    }

    toggleCart(false); // Sepeti kapat

    Swal.fire({
        title: 'Ödeme İşleniyor...',
        html: 'Lütfen bekleyiniz, banka ile iletişim kuruluyor.',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
            Swal.fire({
                icon: 'success',
                title: 'Siparişiniz Alındı!',
                text: 'Teşekkür ederiz, kargoya verilince haber vereceğiz.',
                confirmButtonColor: '#4CAF50'
            });
            cart = []; // Sepeti boşalt
            updateCartUI();
        }
    });
});

// Başlat
getProducts();