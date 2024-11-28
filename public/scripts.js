fetch('/api/users')
    .then(response => response.json())
    .then(data => {
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = data.map(user => `<p>${user.name} (${user.email})</p>`).join('');
    })
    .catch(err => console.log('Erro ao carregar os usuários', err));


// Mostrr formulário de cadastro
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// Exibir o formulário de login
function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

// Função para login
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
        alert(data.message);
        localStorage.setItem('userId', data.user.id);  
        window.location.href = 'usuario.html';
    } else {
        alert(data.message);
    }
});

// Função para cadastro
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const surname = document.getElementById('registerSurname').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value;

    const response = await fetch('/api/cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, surname, email, password, phone }),
    });

    const data = await response.json();
    if (response.ok) {
        alert(data.message);
        showLoginForm();  // Exibe o formulário de login após cadastro bem-sucedido
    } else {
        alert(data.message);
    }
});
