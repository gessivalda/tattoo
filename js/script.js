document.addEventListener('DOMContentLoaded', function () {
    let scheduledDates = []; // Inicializa a variável antes de qualquer uso
    let id = 0
    /* MENU MOBILE */
    const menuToggle = document.querySelector('.menu-toggle');
    const navUl = document.querySelector('.main-nav ul');

    menuToggle?.addEventListener('click', () => {
        navUl.style.display =
            navUl.style.display === 'flex' ? '' : 'flex';
    });

    /* MENU ARTISTA */
    const menuArtista = document.querySelector('#menuArtista');

    /* CARREGAR EQUIPE DO SERVIÇO */
    function carregarEquipe() {
        const swiperWrapper = document.querySelector('.swiper-wrapper');

        fetch('http://localhost:8080/tattoos', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const equipe = Array.isArray(data);
                scheduledDates = data
                console.log(this.scheduledDates);

                let cardsHTML = '';
                // FOR para iterar sobre os membros da equipe
                for (let i = 0; i < data.length; i++) {
                    const membro = data[i];




                    cardsHTML += `
                <div class="card-artist container">
                <div class="artist-photo" style="background-image:url('${membro.image || membro.foto}')"></div>
                <div class="artist-body">
                <h3>${membro.name}</h3>
                </div>
                </div>
                `;
                }

                swiperWrapper.innerHTML = cardsHTML;
            })
            .catch(error => {
                console.error('Erro ao carregar equipe:', error);
            });
    }

    /* FUNÇÃO PARA ABRIR TELA DE ERRO */
    function abrirTelaErro(mensagem) {
        const modal = document.createElement('div');
        modal.className = 'modal-erro';
        modal.innerHTML = `
<div class="modal-conteudo">
<div class="modal-header">
<h2>Erro</h2>
<button class="modal-fechar">&times;</button>
</div>
<div class="modal-body">
<p>${mensagem}</p>
</div>
<div class="modal-footer">
<button class="btn-fechar-modal">Fechar</button>
</div>
</div>
`;

        document.body.appendChild(modal);

        const fecharBtn = modal.querySelector('.modal-fechar');
        const fecharModal = modal.querySelector('.btn-fechar-modal');

        fecharBtn?.addEventListener('click', () => modal.remove());
        fecharModal?.addEventListener('click', () => modal.remove());
    }

    function abrirTelaArtista(mensagem, nomeArtista, datasAgendadas,) {
        console.log('Abrindo tela de agendamento para:', nomeArtista, datasAgendadas);
        const modal = document.createElement('div');
        modal.className = 'modal-erro';
        modal.innerHTML = `
            <div class="modal-conteudo">
            <div class="modal-header">
            <h2 class="section-title center">Agendar uma data com ${nomeArtista}</h2>
            <button class="modal-fechar">&times;</button>
            </div>
            <div class="modal-body">
            <label for="dataAgendamento">Selecione uma data:</label>
            <div></div>
            <input type="date" id="dataAgendamento" placeholder="Selecione uma data" class="form-control">
            </div>
            <div class="modal-footer">
            <button type="button" class="btn  btn-dark" id="confirmarAgendamento">Confirmar</button>
            </div>
            </div>
            `;

        document.body.appendChild(modal);

        const today = new Date().toISOString().split('T')[0];
        const dateInput = modal.querySelector('#dataAgendamento');
        dateInput.setAttribute('min', today);

        const fecharBtn = modal.querySelector('.modal-fechar');
        const fecharModal = modal.querySelector('.btn-fechar-modal');

        fecharBtn?.addEventListener('click', () => modal.remove());
        fecharModal?.addEventListener('click', () => modal.remove());

        const confirmarBtn = modal.querySelector('#confirmarAgendamento');
        confirmarBtn.disabled = true;
        confirmarBtn.style.backgroundColor = 'gray';
        confirmarBtn.style.cursor = 'not-allowed';

        dateInput.addEventListener('input', () => {
            confirmarBtn.disabled = !dateInput.value;
            if (confirmarBtn.disabled) {
                confirmarBtn.style.backgroundColor = 'gray';
                confirmarBtn.style.cursor = 'not-allowed';
            } else {
                confirmarBtn.style.backgroundColor = '';
                confirmarBtn.style.cursor = 'pointer';
            }
        });

        confirmarBtn?.addEventListener('click', () => {
            const selectedDate = dateInput.value;

            // Fecha o modal imediatamente ao clicar em confirmar
            modal.remove();

            const formattedDate = selectedDate.split('/').reverse().join('-'); // Formata a data para o formato "2026-03-25"

            fetch('http://localhost:8080/tattoos/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: formattedDate, id: id }) // Envia a data formatada e o ID do artista
            }).then(response => {
                if (response.ok) {
                    console.log('Agendamento confirmado!');
                    
                    carregarEquipe()

                    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const toastContainer = document.createElement('div');
                    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';

                    const toast = document.createElement('div');
                    toast.id = 'liveToast';
                    toast.className = 'toast text-bg-light'; // Fundo branco com texto escuro
                    toast.setAttribute('role', 'alert');
                    toast.setAttribute('aria-live', 'assertive');
                    toast.setAttribute('aria-atomic', 'true');

                    toast.innerHTML = `
                        <div class="toast-header">
                            <strong class="me-auto text-success">Salvo com sucesso!</strong>
                            <small>${currentTime}</small>
                            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div class="toast-body">
                           Agendamento confirmado para ${selectedDate.split('-').reverse().join('/')} com ${nomeArtista}!
                        </div>
                    `;

                    toastContainer.appendChild(toast);
                    document.body.appendChild(toastContainer);

                    const bootstrapToast = new bootstrap.Toast(toast);
                    bootstrapToast.show();
                }
            }).catch(error => {
                console.error('Erro:', error);
                alert('Erro de conexão.');
            });
        });

        // Configura o calendário para exibir em português
        function configurarCalendario(datasAgendadas) {
            const dateInput = document.querySelector('#dataAgendamento');

            if (dateInput) {
                const today = new Date();

                flatpickr.localize(flatpickr.l10ns.pt); // Configura o idioma para português

                flatpickr(dateInput, {
                    disable: [
                        function (date) {
                            // Bloqueia datas menores que hoje
                            return date < today;
                        },
                        ...datasAgendadas.map(data => {
                            return new Date(data + 'T00:00:00'); // Garante que a data correta seja bloqueada
                        })
                    ],
                    dateFormat: 'd/m/Y', // Formato de data em português
                    onDayCreate: function(dObj, dStr, fp, dayElem) {
                        const disabledDates = datasAgendadas.map(data => new Date(data + 'T00:00:00').toDateString());
                        const dayDate = new Date(dayElem.dateObj).toDateString();

                        if (disabledDates.includes(dayDate)) {
                            dayElem.style.color = 'red'; // Pinta somente o número do dia de vermelho
                            dayElem.style.pointerEvents = 'none'; // Remove a possibilidade de clicar
                        } else if (new Date(dayElem.dateObj) < today) {
                            dayElem.style.color = 'red'; // Define o texto vermelho para datas menores que hoje
                            dayElem.style.pointerEvents = 'none'; // Remove a possibilidade de clicar
                        }
                    }
                });
            }
        }

        configurarCalendario(datasAgendadas);
    }
    /* 
       menuArtista?.addEventListener('click', function (e) {
           e.preventDefault();
   
           fetch('/listArtis', {
               method: 'GET'
           })
               .then(response => response.json())
               .then(data => {
                   console.log('Artistas carregados:', data);
                   abrirTelaArtista(data)
                   // Aqui você pode processar os dados dos artistas
               })
               .catch(error => {
                   console.error('Erro ao carregar artistas:', error);
                   abrirTelaArtista(data)
   
                   abrirTelaErro('Erro ao carregar a lista de artistas. Tente novamente mais tarde.');
               });
       });
   
      SMOOTH SCROLL */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {

            const href = this.getAttribute('href');
            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }

        });
    });



    /* CARREGAR GALERIA */
    function carregarGaleria() {
        const galeriaContainer = document.querySelector('#galeriaContainer');

        let galeriaHTML = '';

        // FOR para iterar sobre as imagens
        for (let i = 0; i < mockGaleria.length; i++) {
            const imagem = mockGaleria[i];
            galeriaHTML += `
            <div class="col" id="galeria">
            <div class="galeria-item col" data-id="${imagem.id}">
            <img src="img/${imagem.imagem}" alt="${imagem.nome}" class="galeria-img">
            <p class="galeria-nome">${imagem.nome}</p>
            </div>
            </div>
            `;
        }

        //  galeriaHTML += `

        //         <div class="col">
        //         <div class="galeria-item" data-id="${imagem.id}">
        //         <img src="${imagem.imagem}" alt="Tatuagem ${imagem.id}" class="img-fluid rounded">
        //         </div>
        //         </div>
        //         `;

        galeriaContainer.innerHTML = galeriaHTML;

        // Adicionar event listener em cada imagem
        const imagensGaleria = document.querySelector('#galeria');
        imagensGaleria.forEach(img => {
            img.addEventListener('click', function (e) {
                e.preventDefault();
                const nomeArtista = this.alt;
                abrirTelaArtista('Agendamento', nomeArtista, scheduledDates);
            });
        });

        // Delegar o evento de clique ao contêiner da galeria
        galeriaContainer.addEventListener('click', function (e) {
            const target = e.target;
            if (target.tagName === 'IMG' && target.classList.contains('galeria-img')) {
                e.preventDefault();
                const nomeArtista = target.alt;
                abrirTelaArtista('Agendamento', nomeArtista);
            }
        });

        // Delegar o evento de clique aos cards com a classe galeria-item
        galeriaContainer.addEventListener('click', function (e) {
            const target = e.target.closest('.galeria-item'); // Verifica se o clique foi em um card
            if (target) {
                e.preventDefault();
                const nomeArtista = target.querySelector('.galeria-nome').textContent;
                abrirTelaArtista('Agendamento', nomeArtista);
            }
        });
    }

    /* CARREGAR EQUIPE QUANDO PÁGINA CARREGAR */
    carregarEquipe();

    /* TYPING ANIMATION - SEÇÃO SOBRE NÓS */
    const typingTexts = document.querySelectorAll('.typing-text');
    const aboutContent = document.getElementById('aboutContent');
    const aboutList = document.getElementById('aboutList');

    // Velocidades de digitação (em ms por caractere)
    const typingSpeeds = [8, 8, 8, 8, 8]; // Velocidade ultra-rápida
    let currentTextIndex = 0;

    function typeCharacter(element, text, speed, index) {
        return new Promise((resolve) => {
            let charIndex = 0;
            element.textContent = '';
            element.classList.add('typing-active');

            const typeInterval = setInterval(() => {
                if (charIndex < text.length) {
                    element.textContent += text[charIndex];
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                    // Adicionar cursor piscante
                    const cursor = document.createElement('span');
                    cursor.className = 'typing-cursor-char';
                    element.appendChild(cursor);

                    // Remover cursor após um tempo
                    setTimeout(() => {
                        cursor.remove();
                        resolve();
                    }, 600);
                }
            }, speed);
        });
    }

    function startTypingAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    (async () => {
                        // Fazer typing de cada parágrafo sequencialmente
                        for (let i = 0; i < typingTexts.length; i++) {
                            const element = typingTexts[i];
                            const text = element.getAttribute('data-text');
                            const speed = typingSpeeds[i] || 50;

                            await typeCharacter(element, text, speed, i);
                        }

                        // Mostrar lista após todas as animações
                        // aboutList.classList.add('show');
                    })();

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });

        if (aboutContent) {
            observer.observe(aboutContent);
        }
    }

    startTypingAnimation();

    /* EVENTO DE CLIQUE EM CADA ELEMENTO COM A CLASSE CARD-ARTIST */
    const cards = document.querySelectorAll('.card-artist');

    cards.forEach(card => {
        card.addEventListener('click', function () {
            const nomeArtista = this.querySelector('.artist-body h3').textContent;
            abrirTelaArtista('Agendamento', nomeArtista, this.scheduledDates);
        });
    });

    /* CARREGAR EQUIPE QUANDO PÁGINA CARREGAR */
    const swiperWrapper = document.querySelector('.swiper-wrapper');

    swiperWrapper.addEventListener('click', function (e) {
        const target = e.target.closest('.card-artist'); // Verifica se o clique foi em um card-artist
        if (target) {
            const nomeArtista = target.querySelector('.artist-body h3').textContent;

            // Filtra as datas agendadas para o artista clicado
            const membro = scheduledDates.find(membro => membro.name.trim() === nomeArtista.trim());
            id = membro ? membro.id : null; // Armazena o ID do artista para uso futuro
            const artistaDatas = membro && membro.scheduledDates ? membro.scheduledDates : []; // Garante que apenas as datas do artista sejam usadas

            abrirTelaArtista('Agendamento', nomeArtista, artistaDatas); // Passa as datas filtradas para o modal
        }
    });
});
