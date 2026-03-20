document.addEventListener('DOMContentLoaded', function(){

/* MENU MOBILE */
const menuToggle=document.querySelector('.menu-toggle');
const navUl=document.querySelector('.main-nav ul');

menuToggle?.addEventListener('click',()=>{
navUl.style.display=
navUl.style.display==='flex'?'':'flex';
});

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
a.addEventListener('click',function(e){

const href=this.getAttribute('href');
const target=document.querySelector(href);

if(target){
e.preventDefault();
target.scrollIntoView({
behavior:'smooth',
block:'start'
});
}

});
});

/* SWIPER */
new Swiper('.equipe-swiper',{
slidesPerView:3,
spaceBetween:22,
loop:true,
navigation:{
nextEl:'.swiper-button-next',
prevEl:'.swiper-button-prev',
},
pagination:{
el:'.swiper-pagination',
clickable:true
},
breakpoints:{
0:{slidesPerView:1},
700:{slidesPerView:2},
1000:{slidesPerView:3}
}
});

});