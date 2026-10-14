const PRODUCTS = [
 {id:'ruby',name:'Ruby Radiance',category:'gemstone',label:'THE RED EDIT',kind:'ruby',price:4500,description:'A vivid red gemstone selected for its bold, timeless character.'},
 {id:'emerald',name:'Emerald Essence',category:'gemstone',label:'NATURAL BEAUTY',kind:'emerald',price:6200,description:'A rich green look inspired by one of nature’s most captivating colours.'},
 {id:'sapphire',name:'Blue Sapphire',category:'gemstone',label:'THE CLASSIC',kind:'sapphire',price:7800,description:'A deep blue statement with a quietly confident presence.'},
 {id:'pearl',name:'Pearl Grace Necklace',category:'jewellery',label:'TIMELESS PIECE',kind:'pearl',price:3500,description:'A graceful, understated style for special moments and everyday elegance.'},
 {id:'ring',name:'Ruby Signature Ring',category:'jewellery',label:'SIGNATURE',kind:'ring',price:5400,description:'A ruby-inspired centrepiece framed in a classic gold-tone design.'},
 {id:'pendant',name:'Emerald Pendant',category:'jewellery',label:'GIFT FAVOURITE',kind:'pendant',price:4200,description:'A refined pendant design with a rich green gemstone-inspired centre.'}
];
const $ = s => document.querySelector(s); const $$ = s => [...document.querySelectorAll(s)];
let cart = [];
const rupees = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
function art(kind, extra=''){return `<span class="product-art ${kind} ${extra}" aria-hidden="true"></span>`}

function renderProducts(filter = 'all') {
  const items = PRODUCTS.filter(p => filter === 'all' || p.category === filter);

  $('#product-grid').innerHTML = items.map(p => {
    const images = {
      ruby: 'images/ruby.jpg',
      emerald: 'images/emerald.jpg',
      sapphire: 'images/sapphire.jpg'
    };

    const image = images[p.id];

    return `<article class="product-card">
      <div class="product-image">
        <span class="product-label">${p.label}</span>
        ${image
          ? `<img src="${image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy">`
          : art(p.kind)}
      </div>
      <div class="product-info">
        <div class="product-meta">
          <div>
            <h3>${p.name}</h3>
            <div class="product-category">${p.category === 'gemstone' ? 'Gemstone' : 'Jewellery'}</div>
          </div>
          <div class="product-price">${rupees(p.price)}</div>
        </div>
        <p>${p.description}</p>
        <button class="add-button" data-add="${p.id}">Add to bag <span>＋</span></button>
      </div>
    </article>`;
  }).join('');

  $$('[data-add]').forEach(b => b.addEventListener('click', () => addToCart(b.dataset.add)));
}
function addToCart(id){const found=cart.find(x=>x.id===id);found?found.qty++:cart.push({id,qty:1});renderCart();openCart();}
function total(){return cart.reduce((sum,row)=>sum+PRODUCTS.find(p=>p.id===row.id).price*row.qty,0)}
function renderCart(){const count=cart.reduce((s,x)=>s+x.qty,0);$('#cart-count').textContent=count;$('#drawer-count').textContent=`(${count})`;$ ('#cart-total').textContent=rupees(total());$('#checkout-total').textContent=rupees(total());$('#checkout-items-label').textContent=`${count} item${count===1?'':'s'}`;$('#cart-items').innerHTML=cart.length?cart.map(row=>{const p=PRODUCTS.find(p=>p.id===row.id);return `<div class="cart-row"><div class="cart-thumb">${art(p.kind)}</div><div><h4>${p.name}</h4><small>${rupees(p.price)} each</small><div class="qty-control"><button data-qty="${p.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${row.qty}</span><button data-qty="${p.id}" data-delta="1" aria-label="Increase quantity">+</button></div></div><button class="remove-item" data-remove="${p.id}">Remove</button></div>`}).join(''):'<p class="empty-cart">Your bag is waiting for something beautiful.</p>';$$('[data-qty]').forEach(b=>b.addEventListener('click',()=>changeQty(b.dataset.qty,Number(b.dataset.delta))));$$('[data-remove]').forEach(b=>b.addEventListener('click',()=>{cart=cart.filter(x=>x.id!==b.dataset.remove);renderCart()}));$('#checkout-button').disabled=!cart.length;$('#checkout-button').style.opacity=cart.length?'1':'.5';}
function changeQty(id,delta){const row=cart.find(x=>x.id===id);if(!row)return;row.qty+=delta;if(row.qty<=0)cart=cart.filter(x=>x.id!==id);renderCart()}
function openCart(){$('#cart-drawer').classList.add('open');$('#drawer-backdrop').classList.add('open');$('#cart-drawer').setAttribute('aria-hidden','false');document.body.classList.add('no-scroll')}
function closeCart(){$('#cart-drawer').classList.remove('open');$('#drawer-backdrop').classList.remove('open');$('#cart-drawer').setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll')}
function openCheckout(){if(!cart.length)return;closeCart();$('#checkout-message').textContent='';$('#checkout-modal').classList.add('open');document.body.classList.add('no-scroll')}
function closeCheckout(){$('#checkout-modal').classList.remove('open');document.body.classList.remove('no-scroll')}
$$('.filter').forEach(b=>b.addEventListener('click',()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProducts(b.dataset.filter)}));$('#open-cart').addEventListener('click',openCart);$('#close-cart').addEventListener('click',closeCart);$('#drawer-backdrop').addEventListener('click',closeCart);$('#checkout-button').addEventListener('click',openCheckout);$('#close-checkout').addEventListener('click',closeCheckout);$('#checkout-modal').addEventListener('click',e=>{if(e.target===$('#checkout-modal'))closeCheckout()});$('#year').textContent=new Date().getFullYear();
$('#checkout-form').addEventListener('submit',async e=>{e.preventDefault();const form=new FormData(e.currentTarget);const payment=form.get('payment');const customer={name:form.get('name'),phone:form.get('phone'),email:form.get('email'),address:form.get('address')};const items=cart.map(x=>({id:x.id,quantity:x.qty}));const message=$('#checkout-message');const btn=$('#place-order');btn.disabled=true;btn.textContent='Please wait…';
 try {if(payment==='cod'){const payload={store:'K Star Gems',customer,items,subtotal:total(),payment:'Cash on delivery',note:'Demo request only — merchant must confirm availability and delivery.'};const text=encodeURIComponent(`K STAR GEMS — COD ORDER REQUEST\nName: ${customer.name}\nPhone: ${customer.phone}\nEmail: ${customer.email||'Not provided'}\nAddress: ${customer.address}\nItems:\n${cart.map(row=>{const p=PRODUCTS.find(p=>p.id===row.id);return `• ${p.name} x ${row.qty} — ${rupees(p.price*row.qty)}`}).join('\n')}\nSubtotal: ${rupees(total())}\n\nThis is a request for confirmation, not a confirmed order.`);message.innerHTML=`<b>Demo only:</b> no order has been saved. To enable COD, configure the store's official order inbox or backend. You can copy the request details from below.`;const pre=document.createElement('textarea');pre.readOnly=true;pre.rows=7;pre.value=decodeURIComponent(text);pre.style.cssText='width:100%;margin-top:10px;background:#090909;color:#e8dfca;border:1px solid #554a32;padding:10px;font-size:10px';message.appendChild(pre);const copy=document.createElement('button');copy.type='button';copy.className='button button-gold full-width';copy.textContent='Copy order request';copy.onclick=async()=>{try{await navigator.clipboard.writeText(pre.value);copy.textContent='Copied — paste into your order inbox'}catch{pre.select();document.execCommand('copy');copy.textContent='Select and copy the order text'}};message.appendChild(copy);}
 else {const response=await fetch('/api/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,customer})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Online checkout is not configured yet.');const options={key:data.keyId,amount:data.amount,currency:'INR',name:'K Star Gems',description:'Gemstone and jewellery order',order_id:data.orderId,prefill:{name:customer.name,email:customer.email,contact:customer.phone},theme:{color:'#d9b56c'},handler:async function(result){const verify=await fetch('/api/verify-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...result,items,customer})});const verified=await verify.json();if(!verify.ok||!verified.verified){message.textContent='We could not verify the payment. Please contact the store before retrying.';return}message.textContent='Payment verified by the server. This starter does not yet store or fulfil orders; connect order storage before live sales.';cart=[];renderCart();}};const razorpay=new Razorpay(options);razorpay.on('payment.failed',()=>{message.textContent='Payment failed or was cancelled. You can retry after checking with the store.'});razorpay.open();message.textContent='Opening secure payment checkout…';}}
 catch(err){message.textContent=err.message||'Checkout is not configured. Please try again later.'}finally{btn.disabled=false;btn.innerHTML='Continue securely <span>→</span>'}});
renderProducts();renderCart();
